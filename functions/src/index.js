import {initializeApp} from "firebase-admin/app";

initializeApp();

import * as reviews from "./reviews.js"

export const sanitizeAppDocument = reviews.sanitizeAppDocument;
export const scheduleAppsReviewsCheck = reviews.scheduleAppsReviewsCheck;
export const triggerAppsReviewsCheck = reviews.triggerAppsReviewsCheck;
