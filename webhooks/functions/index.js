// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const functions = require("firebase-functions");

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
const { getFirestore } = require("firebase-admin/firestore");
const { FirebaseFunctionsRateLimiter } = require("firebase-functions-rate-limiter");


admin.initializeApp();
const firestore = admin.firestore();

const addLimiter = FirebaseFunctionsRateLimiter.withFirestoreBackend(
  {
      name: "rate_limiter_collection",
      maxCalls: 1,
      periodSeconds: 60,
  },
  firestore,
);

const getLimiter = FirebaseFunctionsRateLimiter.withFirestoreBackend(
  {
      name: "rate_limiter_collection",
      maxCalls: 3,
      periodSeconds: 15,
  },
  firestore,
);

// Set the CORS headers to allow requests from your extension's origin
const cors = require("cors")({
  origin: "chrome-extension://gddgagfolgbknldmhngagpflgnicjkcl",
});

/**
 * add messages to firestore
 */
exports.addMessages = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      await addLimiter.rejectOnQuotaExceededOrRecordUsage();

      const messages = req.body.messages;

      if (!Array.isArray(messages)) {
        res
        .status(403)
        .json({ success: false, message: "Bad request." });
      }

      // Push the new messages into Firestore using the Firebase Admin SDK.
      for (let message of messages) {
        await getFirestore()
          .collection("messages")
          .add({
            message,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          });
      }

      res.json({ result: `Messages added successfully.` });
    } catch (error) {
      console.error("Error adding messages:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to add messages." });
    }
  });
});

/**
 * get messages based on page start and page size
 */
exports.getMessages = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    await getLimiter.rejectOnQuotaExceededOrRecordUsage();

    let { pageStart, pageSize } = req.body;

    pageStart = parseInt(pageStart) || 0;
    pageSize = parseInt(pageSize) || 10;

    const messagesRef = getFirestore().collection("messages");

    // get starting document
    const startDoc = await messagesRef
      .orderBy('timestamp')
      .limit(pageStart)
      .get()
      .then((snapshot) => {
        const docs = snapshot.docs;
        return docs[docs.length - 1]; // Get the last document as the starting point
      });

    // Retrieve messages from Firestore based on start doc and pageSize
    const query = messagesRef
      .orderBy("timestamp")
      .startAfter(startDoc)
      .limit(pageSize);

    query
      .get()
      .then((snapshot) => {
        const messages = [];
        snapshot.forEach((doc) => {
          console.log(doc);
          const { message } = doc.data();
          messages.push(message);
        });
        res.json(messages);
      })
      .catch((error) => {
        console.error("Error retrieving messages:", error);
        res.status(500).send("Error retrieving messages");
      });
  });
});
