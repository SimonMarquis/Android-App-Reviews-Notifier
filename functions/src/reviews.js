/** @typedef { import("googleapis").androidpublisher_v3 } */

const {getFirestore} = require("firebase-admin/firestore");

const logger = require("firebase-functions/logger");
const {defineSecret} = require("firebase-functions/params");

const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {onRequest} = require("firebase-functions/v2/https");
const {onSchedule} = require("firebase-functions/v2/scheduler");

const serviceAccount = defineSecret("SERVICE_ACCOUNT");
const slackIncomingWebhook = defineSecret("SLACK_INCOMING_WEBHOOK");

const {google} = require("googleapis");
const {IncomingWebhook} = require("@slack/webhook");

const Types = require("./types");
const Utils = require("./utils");
const Messages = require("./messages");

const apps = getFirestore().collection("apps");

/**
 * Sanitize new `apps/{id}` documents with default values from {@link Types.DEFAULT_APP_DOCUMENT}.
 */
exports.sanitizeAppDocument = onDocumentCreated("apps/{id}", async (event) => {
    if (!event.data) return;
    logger.log("🆕 New document", event.data.data());
    await event.data.ref.set({...Types.DEFAULT_APP_DOCUMENT, ...event.data.data()}, {merge: true});
});

/**
 * Schedule automated reviews check.
 */
exports.scheduleAppsReviewsCheck = onSchedule({
    secrets: [serviceAccount, slackIncomingWebhook],
    schedule: "*/15 * * * *",
    timeZone: "UTC",
}, async (event) => {
    logger.log("⏰", event);
    await checkReviews();
});

/**
 * Manual trigger for reviews check.
 */
exports.triggerAppsReviewsCheck = onRequest({secrets: [serviceAccount, slackIncomingWebhook]}, async (request, response) => {
    logger.log("⚡");
    await checkReviews();
    response.sendStatus(200);
});

async function checkReviews() {
    /** @type {QuerySnapshot<DocumentData|AppDocument, DocumentData>} */
    const snapshot = await apps.get();
    if (snapshot.empty) return;

    const webhook = new IncomingWebhook(slackIncomingWebhook.value());
    const publisher = google.androidpublisher({
        version: "v3",
        auth: new google.auth.GoogleAuth({
            scopes: "https://www.googleapis.com/auth/androidpublisher",
            credentials: JSON.parse(serviceAccount.value()),
        }),
    });

    /** @param {Document} document */
    const isDocumentInvalid = (document) => !document.data().packageName;
    const invalidDocuments = snapshot.docs.filter(isDocumentInvalid);
    if (invalidDocuments.length > 0) logger.log(`🚫 ${invalidDocuments.length} invalid document(s)`, {documents: invalidDocuments.map(it => it.data())});

    /** @param {Document} document */
    const isDocumentIgnored = (document) => document.data().ignored === true;
    const ignoredDocuments = snapshot.docs.filter(isDocumentIgnored);
    if (ignoredDocuments.length > 0) logger.log(`🫣 ${ignoredDocuments.length} ignored document(s)`, {documents: ignoredDocuments.map(it => it.data())});

    /** @param {Document} document */
    const isDocumentValid = (document) => !isDocumentInvalid(document) && !isDocumentIgnored(document);
    const validDocuments = snapshot.docs.filter(isDocumentValid);
    logger.log(`📦 ${validDocuments.length} valid document(s)`, {documents: validDocuments.map(it => it.data())});

    /** @param {Document} document */
    const request = async (document) => await publisher.reviews.list({
        packageName: document.data().packageName,
        // By default, 10 reviews appear on each page. You can display up to 100 reviews per page by setting the maxResults parameter in your request.
        // https://developers.google.com/android-publisher/reply-to-reviews#:~:text=display%20up%20to-,100%20reviews,-per%20page%20by
        maxResults: 100,
    });

    /** @type {Promise<DocumentedResponse>[]} */
    const requests = validDocuments.map(async (document) => ({
        document: document,
        response: (await request(document)).data,
    }));

    /** @type {PromiseSettledResult<Awaited<Promise<DocumentedResponse>>>[]} */
    const responses = await Promise.allSettled(requests);

    /** @type {PromiseRejectedResult[]} */
    const rejected = responses.filter(it => it.status === "rejected");
    if (rejected.length > 0) logger.log(`💥 ${rejected.length} rejected request(s)`, {reasons: rejected.map(it => it.reason)});

    /** @type {PromiseFulfilledResult<Awaited<Promise<DocumentedResponse>>>[]} */
    const fulfilled = responses.filter(it => it.status === "fulfilled");

    const /** @type {Schema$Review[]} */ allReviews = fulfilled.flatMap((it) => it.value.response.reviews ?? []);
    const /** @type {Schema$Comment[]} */ allComments = allReviews.flatMap((it) => it.comments ?? []);
    logger.log(
        `📫 ${allReviews.length} review(s) • ${allComments.length} comment(s)`,
        {
            data: fulfilled.filter(it => it.value.response.reviews).map(it => ({
                name: it.value.document.data().packageName,
                response: it.value.response,
            })),
        },
    );

    for (const {document, response} of fulfilled.map(it => it.value)) {
        const /** @type {Schema$Review[]} */ reviews = response.reviews ?? [];
        const data = document.data();
        const timestamp = parseInt(data.timestamp) || -Infinity;

        const /** @type {number[]} */ timestamps = [];
        for (const review of reviews.reverse()) {
            const comments = review.comments/*.reverse()*/;
            for (const {userComment, developerComment} of comments) {
                let /** @type {number} */ commentTimestamp,
                    /** @type {{blocks: any[]}} */ blocks;
                if (userComment) {
                    commentTimestamp = Utils.timestampOf(userComment);
                    blocks = Messages.create(
                        Messages.headerBlock(data),
                        Messages.newReviewBlock(review, userComment),
                        Messages.footerUserBlock(userComment),
                        Messages.linksBlock(document, data, review, userComment),
                    );
                } else if (developerComment) {
                    commentTimestamp = Utils.timestampOf(developerComment);
                    blocks = Messages.create(
                        Messages.headerBlock(data),
                        Messages.newResponseBlock(review, developerComment),
                        Messages.footerDeveloperBlock(developerComment),
                        Messages.linksBlock(document, data, review, developerComment),
                    );
                } else {
                    logger.error("👾 Unexpected comment type!");
                    continue;
                }
                if (commentTimestamp <= timestamp) continue;
                timestamps.push(commentTimestamp);
                logger.log("📨 Sending Slack message", JSON.stringify(blocks));
                await webhook.send(blocks).catch(reason => logger.error(reason));
                await Utils.snooze(1_000); // Slack rate limit: https://api.slack.com/apis/rate-limits#overview
            }
        }

        const newTimestamp = Math.max(...timestamps);
        if (newTimestamp > 0 && newTimestamp !== timestamp) await document.ref.update("timestamp", newTimestamp);
    }
}
