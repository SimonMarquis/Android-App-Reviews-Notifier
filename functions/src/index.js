const {initializeApp} = require("firebase-admin/app");

initializeApp();

const reviews = require("./reviews")

exports.sanitizeAppDocument = reviews.sanitizeAppDocument;
exports.scheduleAppsReviewsCheck = reviews.scheduleAppsReviewsCheck;
exports.triggerAppsReviewsCheck = reviews.triggerAppsReviewsCheck;
