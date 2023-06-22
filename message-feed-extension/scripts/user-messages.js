document.addEventListener("DOMContentLoaded", async () => {
  const dataContainer = document.getElementById("dataContainer");

  connectIndexedDB()
    .then((db) => {
      const transaction = db.transaction("messages", "readonly");
      const store = transaction.objectStore("messages");
      const cursor = store.openCursor();

      cursor.onsuccess = (event) => {
        const cursor = event.target.result;

        if (cursor) {
          const item = cursor.value;
          const itemElement = document.createElement("li");
          itemElement.textContent = item.message;
          dataContainer.appendChild(itemElement);

          cursor.continue();
        }
      };
  });
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
