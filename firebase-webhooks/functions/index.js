// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access Firestore.
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();

// Set the CORS headers to allow requests from your extension's origin
const cors = require('cors')({
  origin: 'chrome-extension://gddgagfolgbknldmhngagpflgnicjkcl',
});

/**
 * add messages to firestore
 */
exports.addMessages = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => { 
    try {
      const messages = req.body.messages;
  
      // Push the new messages into Firestore using the Firebase Admin SDK.
      for (let message of messages) {
        await getFirestore().collection("messages").add({ message });
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
  cors(req, res, () => { 
    let { pageStart, pageSize } = req.body;
  
    pageStart = pageStart || 0;
    pageSize = pageSize | 10;
  
    // Retrieve messages from Firestore based on start and pageSize
    const messagesRef = db.collection("messages");
    const query = messagesRef.orderBy("timestamp").startAt(pageStart).limit(pageSize);
  
    query
      .get()
      .then((snapshot) => {
        const messages = [];
        snapshot.forEach((doc) => {
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
