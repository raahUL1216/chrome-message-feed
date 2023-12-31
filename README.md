## Process flow 
<br/>

![alt text](/User%20Messages%20-%20Flowchart.png)

<br/>

## Development

- Open Google Chrome and go to **chrome://extensions**
- Enable **Developer mode** by toggling the switch in the upper-right corner.
- Click on the **Load unpacked** button and select the **message-feed-extension** directory.
- The Chrome extension will be installed and the browser action icon will appear in the Chrome toolbar.
- To test and make changes locally, edit any extension file(s) and go to chrome://extensions. Now, click on the "Reload" button under **Message Feed** extension.

<br/>

## Webhooks

- Refer to
[Firebase Cloud Function](https://firebase.google.com/docs/functions/get-started?gen=1st) to setup serverless functions (or webhooks).

<br />

Go to webhooks directory
> cd webhooks/functions

Install dependencies
> npm i

Login to firebase and deploy webhooks
> firebase login
>
> firebase deploy