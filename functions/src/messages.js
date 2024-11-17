/** @typedef { import("googleapis").androidpublisher_v3 } */

import {getApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";

import * as BlockKit from "./block-kit.js";
import * as Utils  from "./utils.js";
import localeEmoji from "locale-emoji";

/**
 * @param {...any} blocks
 * @return {{blocks: any[]}}
 */
export const create = (...blocks) => ({
    blocks: blocks,
    unfurl_links: false,
    unfurl_media: false,
});

/**
 * @param {FirebaseFirestore.DocumentData|AppDocument} app
 */
export const headerBlock = app => BlockKit.contextBlock(
    app.icon ? BlockKit.imageElement(app.icon, "") : undefined,
    BlockKit.mrkdwnElement(BlockKit.bold(BlockKit.linkify(app.name, Utils.appLink(app.packageName)))),
);

/**
 * @param {Schema$Review} review
 * @param {Schema$UserComment} comment
 */
export const newReviewBlock = (review, comment) => {
    const flag = localeEmoji(comment.reviewerLanguage) || "🏁";
    return BlockKit.richTextBlock(
        BlockKit.richTextQuoteBlock(
            BlockKit.textElement("★".repeat(comment.starRating) + "☆".repeat(5 - comment.starRating), {bold: true}),
            BlockKit.textElement("\t"),
            BlockKit.emojiElement(flag, Array.from(flag, s => s.codePointAt(0).toString(16)).join("-")),
            BlockKit.textElement(" "),
            BlockKit.textElement(review.authorName?.trim() || "(unknown)"),
        ),
        BlockKit.richTextQuoteBlock(
            BlockKit.textElement(comment.text.trim(), {italic: true}),
        ),
    );
};

/**
 * @param {Schema$Review} review
 * @param {Schema$DeveloperComment} comment
 */
export const newResponseBlock = (review, comment) => BlockKit.richTextBlock(
    BlockKit.richTextQuoteBlock(
        BlockKit.textElement("Response to: ", {bold: true}),
        BlockKit.textElement(review.authorName?.trim() || "(unknown)"),
    ),
    BlockKit.richTextQuoteBlock(
        BlockKit.textElement(comment.text.trim(), {italic: true}),
    ),
);

/**
 * @param {Schema$UserComment} comment
 */
export const footerUserBlock = comment => BlockKit.contextBlock(
    BlockKit.mrkdwnElement(`*Device*: ${comment.deviceMetadata?.productName || "?"}`),
    BlockKit.mrkdwnElement(`*Brand*: ${comment.deviceMetadata?.manufacturer || "?"}`),
    BlockKit.mrkdwnElement(`*API*: ${comment.androidOsVersion}`),
    BlockKit.mrkdwnElement(`*Version*: ${comment.appVersionName || "?"}${comment.appVersionCode ? ` (${comment.appVersionCode})` : ""}`),
    BlockKit.mrkdwnElement(`*Date*: ${Utils.dateOf(comment)}`),
);

/**
 * @param {Schema$DeveloperComment} comment
 */
export const footerDeveloperBlock = comment => BlockKit.contextBlock(BlockKit.mrkdwnElement(`*Date*: ${Utils.dateOf(comment)}`));

/**
 * @param {QueryDocumentSnapshot<any,any>} document
 * @param {FirebaseFirestore.DocumentData|AppDocument} app
 * @param {Schema$Review} review
 * @param {Schema$UserComment|Schema$DeveloperComment} comment
 */
export const linksBlock = (document, app, review, comment) => BlockKit.contextBlock(
    BlockKit.mrkdwnElement(
        [
            BlockKit.linkify("Reply", Utils.replyLink(app.developerId, app.applicationId, review.reviewId)),
            BlockKit.linkify("View", Utils.viewLink(app.packageName, review.reviewId)),
            BlockKit.linkify("Translate", Utils.translateLink(comment.reviewerLanguage, comment.text)),
            BlockKit.linkify("Settings", Utils.settingsLink(getApp().options.projectId, getFirestore().databaseId, document)),
        ].join(" ∙ "),
    ),
);
