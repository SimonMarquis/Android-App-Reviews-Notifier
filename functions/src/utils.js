/** @typedef { import("googleapis").androidpublisher_v3 } */

/**
 * @param {number} ms - Snooze duration in milliseconds
 * @return {Promise}
 */
export const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * @param {Schema$UserComment|Schema$DeveloperComment} comment
 * @return {number}
 */
export const timestampOf = comment => comment.lastModified.seconds * 1000 + comment.lastModified.nanos / 1000000;

/**
 * @param {Schema$UserComment|Schema$DeveloperComment} comment
 * @return {string}
 */
export const dateOf = comment => new Date(timestampOf(comment)).toISOString().split(".")[0].replace("T", " ");

/**
 * @param {?string} packageName
 */
export const appLink = (packageName) => `https://play.google.com/store/apps/details?id=${packageName}`;

/**
 * @param {?string} developerId
 * @param {?string} applicationId
 * @param {string} reviewId
 */
export const replyLink = (developerId, applicationId, reviewId) => `https://play.google.com/console/developers/${developerId ?? "_"}/app/${applicationId ?? "_"}/user-feedback/review-details?reviewId=${reviewId}`;

/**
 * @param {?string} packageName
 * @param {string} reviewId
 */
export const viewLink = (packageName, reviewId) => `https://play.google.com/store/apps/details?id=${packageName}&reviewId=${reviewId}`;

/**
 * @param {?string} reviewerLanguage
 * @param {?string} text
 */
export const translateLink = (reviewerLanguage, text) => `https://translate.google.com/?sl=${reviewerLanguage ?? "auto"}&op=translate&text=${encodeURIComponent(text?.trim() ?? "")}`;

/**
 * Note: the default database name is "(default)", which needs to be translate to "-default-" in the URL.
 *
 * @param {string} projectId
 * @param {string} databaseId
 * @param {FirebaseFirestore.QueryDocumentSnapshot<*, *>} document
 */
export const settingsLink = (projectId, databaseId, document) => `https://console.firebase.google.com/project/${projectId}/firestore/databases/${databaseId.replace(/[()]/g, "-")}/data/${encodeURIComponent(document.ref.path)}`;
