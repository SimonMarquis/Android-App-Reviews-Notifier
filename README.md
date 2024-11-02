# Android App Reviews Notifier

> 🛎️ Get your Android app reviews directly in a Slack channel.

| Review | Response |
|--------|----------|
| ![](art/review-dark.png#gh-dark-mode-only) ![](art/review-light.png#gh-light-mode-only) | ![](art/response-dark.png#gh-dark-mode-only) ![](art/response-light.png#gh-light-mode-only) |

## 📋 Requirements

- [Firebase CLI](https://firebase.google.com/docs/cli)
- [Firebase Functions](https://firebase.google.com/docs/functions) (requires [Blaze pricing plan](https://firebase.google.com/pricing))
- [Firebase Cloud Firestore](https://firebase.google.com/docs/firestore)
- [Google Play developper account](https://play.google.com/console)
- [Google Cloud's Secret Manager](https://cloud.google.com/secret-manager) (requires [billing account](https://cloud.google.com/billing/docs/concepts))
- [Slack Incoming Webhook](https://api.slack.com/messaging/webhooks)

## 🧰 Setup

1. Install required npm dependencies:
   ```shell
   npm --prefix ./functions install
   ```
2. Setup and link your Firebase project:
   ```shell
   firebase use --add
   ```
3. Configure Slack [incoming webhook](https://api.slack.com/messaging/webhooks) secret:
   ```shell
   firebase functions:secrets:set SLACK_INCOMING_WEBHOOK
   ```
4. Configure Google Service Account secret:
   - Enable [Google Play Developer API](https://console.cloud.google.com/apis/library/androidpublisher.googleapis.com) in Google Cloud Console.
   - Create a new [Service Account](https://console.cloud.google.com/iam-admin/serviceaccounts/create?project=_) and generate a `JSON` key.
   - [Invite the Service Account](https://play.google.com/console/developers/users-and-permissions/invite) (email) and grant app permissions.
   ```shell
   firebase functions:secrets:set SERVICE_ACCOUNT
   ```
5. Deploy the Firebase functions:
   ```shell
   firebase deploy --only functions
   ```
6. Add your first app in [Firestore](https://console.firebase.google.com/project/_/firestore):
   - <kbd>+ Start a collection</kbd> and name it `apps`.
   - <kbd>+ Add document</kbd> and <kbd>Auto-ID</kbd> then <kbd>Save</kbd>.
   - The [`sanitizeAppDocument`](functions/src/reviews.js#L27) Firebase function should automatically insert the required fields.
   - Update the document fields accordingly:
      - **`developerId`**: called `Account ID` in the [Google Play Console developer account](https://play.google.com/console/developers/account), also visible in the URL:  
        `https://play.google.com/console/developers/[developerId]`.
      - **`applicationId`**: visible in the [Google Play Console app dashboard](https://play.google.com/console/app/app-dashboard)'s URL:  
        `https://play.google.com/console/developers/[developerId]/app/[applicationId]/app-dashboard`
      - **`packageName`**: visible in the [Google Play Console app dashboard](https://play.google.com/console/app/app-dashboard)'s
      - **`icon`**: the application icon URL that will be used in the Slack messages
      - **`name`**: the application name that will be used in the Slack messages
      - **`ignored`**: set it to `false` when you are ready to fetch reviews
7. The system is now ready and will start to fetch reviews and forward them to your Slack channel!

> [!TIP]
> You can change the default [`*/15 * * * *`](functions/src/reviews.js#L38) (15 min) refresh interval.

> [!IMPORTANT]
> - **User reviews are not stored!**  
>   If you need a backup solution or want to download user reviews, use the [Google Play Console Download reviews reports](https://play.google.com/console/developers/download-reports/reviews) or `gsutils` command line tool ([docs](https://support.google.com/googleplay/android-developer/answer/6135870)).
> - Pagination is not handled to keep the codebase simple.  
>   Only the most recent 100 reviews will be fetched ([API limit](https://developers.google.com/android-publisher/reply-to-reviews#:~:text=up%20to%20100%20reviews%20per%20page)).  
>   If you expect more than 100 reviews between each refresh, reduce the default refresh interval.
> - Reviews can be fetched for a period of 1 week ([API Limit](https://developers.google.com/android-publisher/reply-to-reviews#:~:text=within%20the%20last%20week)).  
>   Beware during during the initial fetch, you might be rate-limited by Slack.

### 🔗 References

- [Google Play Developer API • Reply to Reviews](https://developers.google.com/android-publisher/reply-to-reviews)
- [Google Play Developer API • Reference `reviews.list`](https://developers.google.com/android-publisher/api-ref/rest/v3/reviews/list)
- [Google Play Android Developer API • Metrics](https://console.cloud.google.com/apis/api/androidpublisher.googleapis.com/metrics)
- [Google Cloud Console • Cloud Run functions](https://console.cloud.google.com/functions/list?project=_)
