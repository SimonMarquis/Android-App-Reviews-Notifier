/**
 * @typedef {object} AppDocument
 * @property {?string} applicationId
 * @property {?string} developerId
 * @property {?string} icon
 * @property {?boolean} ignored
 * @property {?string} name
 * @property {?string} packageName
 * @property {?(number|string)=} timestamp
 */

/** @type {AppDocument} */
export const DEFAULT_APP_DOCUMENT = {
    applicationId: null,
    developerId: null,
    icon: null,
    ignored: true,
    name: null,
    packageName: null,
};

/**
 * @typedef {object} DocumentedResponse
 * @property {QueryDocumentSnapshot<AppDocument, AppDocument>} document
 * @property {Schema$ReviewsListResponse} response
 */

/** @typedef {QueryDocumentSnapshot<AppDocument, DocumentData>} Document */
