document.addEventListener("DOMContentLoaded", function () {
  // Get the message feed element
  var messageFeed = document.getElementById("message-feed");

  // Retrieve and display the latest messages
  chrome.storage.local.get(["messages"], function (result) {
    var messages = result.messages || [];
    messageFeed.textContent = messages.join(", ");
  });
});
