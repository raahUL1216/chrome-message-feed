document.addEventListener("DOMContentLoaded", async function () {
  // open messages in new page when user click on new-tab icon
  var button = document.getElementById("show-messages");
  button.addEventListener("click", openNewTab);

  const messagesAvailable = await hasMessagesInLocalDB();

  if (!messagesAvailable) {
    await loadMessages();
  }

  // total messages to show in popup
  const showMessageCount = 2;
  showMessagesInPopup(showMessageCount);
});

function openNewTab() {
  chrome.tabs.create({ url: "user-messages.html" });
}

/**
 * check if indexedDB has any cached results
 * @returns bool
 */
async function hasMessagesInLocalDB() {
  return new Promise((resolve, reject) => {
    connectIndexedDB().then((db) => {
      const transaction = db.transaction("messages", "readonly");
      const objectStore = transaction.objectStore("messages");
      const countRequest = objectStore.count();

      countRequest.onsuccess = () => {
        const recordCount = countRequest.result;
        resolve(recordCount > 0);
      };

      countRequest.onerror = () => {
        reject(countRequest.error);
      };
    }).catch((error) => {
      reject(error);
    });
  });
}

/**
 * get messages, cache it and show them in new page
 */
async function loadMessages() {
  // total messages to fetch from 3rd party API
  const totalMessages = 200;
  const messages = await getMessages(totalMessages);

  if (Array.isArray(messages) && messages.length > 0) {
    await cacheMessages(messages.slice(0, 25));
  
    // send messages to firestore using webhooks
    await storeMessagesInFireStore(messages);
  }
}

/**
 * get messages from 3rd party API
 * @param {*} totalMessages
 */
async function getMessages(totalMessages) {
  const apiURL = `https://baconipsum.com/api/?type=all-meat&paras=${totalMessages}&start-with-lorem=1`;

  // Call 3rd party API
  return fetch(apiURL)
    .then((response) => response.json())
    .then((messages) => {
      console.log('Retrieved messages from 3rd party API successfully');
      return messages;
    })
    .catch((error) => {
      alert('Error while getting messages from API.');
      console.error(error);
    });
}

/**
 * cache messages to IndexedDB
 */
async function cacheMessages(messages) {
  // connect IndexedDB
  connectIndexedDB()
    .then((db) => {
      const transaction = db.transaction("messages", "readwrite");
      const store = transaction.objectStore("messages");

      // store first 25 messages in IndexedDB object store
      messages.forEach((message, index) => {
        store.put({ id: index, message });
      });

      console.log("Messages cached in IndexedDB successfully.");
    })
    .catch(console.error);
}

/**
 * Function to open IndexedDB database
 * @returns
 */
async function connectIndexedDB() {
  const window = this;

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open("message-feed-db", 2);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains("messages")) {
        db.createObjectStore("messages", { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

/**
 * inject messages in popup view
 * @param {*} showMessageCount
 */
function showMessagesInPopup(showMessageCount) {
  connectIndexedDB().then((db) => {
    const transaction = db.transaction("messages", "readonly");
    const store = transaction.objectStore("messages");
    const cursor = store.openCursor();

    let count = 0;
    const dataContainer = document.getElementById("dataContainer");

    cursor.onsuccess = (event) => {
      const cursor = event.target.result;

      if (cursor && count < showMessageCount) {
        const item = cursor.value;
        const itemElement = document.createElement("li");
        itemElement.textContent = item.message;
        dataContainer.appendChild(itemElement);

        count++;
        cursor.continue();
      }
    };
  });
}

async function storeMessagesInFireStore(messages) {
  const webhookURL = "https://us-central1-messagefeed-946a4.cloudfunctions.net";

  fetch(`${webhookURL}/addMessages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  })
    .then(response => response.json())
    .then((response) => {
        console.log(response);
    })
    .catch((error) => {
      console.error("Error saving message", error);
    });
}
