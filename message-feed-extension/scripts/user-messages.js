document.addEventListener("DOMContentLoaded", async () => {
  // Event listener for scroll events
  window.addEventListener("scroll", async () => {
    if (isScrollAtBottom()) {
      const pageStart = document.querySelectorAll(".user-message").length;
      pageSize = 25;

      await lazyLoadMessages(pageStart, pageSize);
    }
  });

  const messagesAvailable = await hasMessagesInLocalDB();

  if (messagesAvailable) {
    await loadInitialMessages();
  } else {
    await lazyLoadMessages(0, 10);
  }
});

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
 * check if indexedDB has any cached results
 * @returns bool
 */
async function hasMessagesInLocalDB() {
  return new Promise((resolve, reject) => {
    connectIndexedDB()
      .then((db) => {
        const transaction = db.transaction("messages", "readonly");
        const objectStore = transaction.objectStore("messages");
        const countRequest = objectStore.count();

        countRequest.onsuccess = () => {
          const recordCount = countRequest.result;
          resolve(recordCount > 0);
        };

        countRequest.onerror = () => {
          console.error(countRequest.error);
          reject(countRequest.error);
        };
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
}

/**
 * loads initial user messages from local db
 */
async function loadInitialMessages() {
  connectIndexedDB().then((db) => {
    const transaction = db.transaction("messages", "readonly");
    const store = transaction.objectStore("messages");
    const cursor = store.openCursor();

    cursor.onsuccess = (event) => {
      const cursor = event.target.result;

      if (cursor) {
        const item = cursor.value;

        renderMessage(item.message);

        cursor.continue();
      }
    };
  });
}

/**
 * lazy load more messages when the user scrolls to the bottom
 * @param {*} pageStart
 * @param {*} pageSize
 */
async function lazyLoadMessages(pageStart, pageSize) {
  showLoader();

  const messages = await retrieveMessages(pageStart, pageSize);

  if (!messages.length) {
    alert("Thats all messages you have for now");
  }

  messages.forEach((message) => {
    renderMessage(message);
  });

  hideLoader();
}

/**
 * retrive remaining messages from firestore
 * @param {*} pageStart
 * @param {*} pageSize
 * @returns
 */
async function retrieveMessages(pageStart, pageSize) {
  const webhookURL = "https://us-central1-messagefeed-946a4.cloudfunctions.net";

  return fetch(`${webhookURL}/getMessages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pageStart, pageSize }),
  })
    .then((response) => response.json())
    .then((response) => {
      return response;
    })
    .catch((error) => {
      alert('Error while getting messages. Please try again in sometime.')
      console.error("Error retrieving message", error);
      hideLoader();
    });
}

/**
 * render user message in web view
 * @param {*} message
 */
function renderMessage(message) {
  const dataContainer = document.getElementById("dataContainer");

  const itemElement = document.createElement("li");
  itemElement.classList.add("user-message");
  itemElement.textContent = message;

  dataContainer.appendChild(itemElement);
}

/**
 * check if the user has scrolled to the bottom of the page
 * @returns
 */
function isScrollAtBottom() {
  const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
  return scrollTop + clientHeight >= scrollHeight;
}

// Show the loader while fetching messages
function showLoader() {
  const loaderContainer = document.querySelector(".loader-container");
  loaderContainer.style.display = "flex";
}

// Hide the loader after fetching messages
function hideLoader() {
  const loaderContainer = document.querySelector(".loader-container");
  loaderContainer.style.display = "none";
}
