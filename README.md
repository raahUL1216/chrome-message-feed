## Development

<br/>

- Open Google Chrome and go to **chrome://extensions**
- Enable **Developer mode** by toggling the switch in the upper-right corner.
- Click on the **Load unpacked** button and select the **chrome-message-feed** directory.
- The Chrome extension will be installed and the browser action icon will appear in the Chrome toolbar.
- To test and make changes to your Chrome extension locally, you can edit the extension's files and reload it on the chrome://extensions page by clicking the "Reload" button under your extension.

## Webhooks

Refer to
[Firebase cloud function](https://firebase.google.com/docs/functions/get-started?gen=1st) to setup webhooks

Go to webhooks directory
> cd firebase-webhooks/functions

Install dependencies
> npm i

Login to firebase and deploy webhooks
> firebase login
>
> firebase deploy