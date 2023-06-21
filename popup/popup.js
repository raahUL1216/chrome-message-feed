document.addEventListener("DOMContentLoaded", function () {
  const messageFeedElement = document.getElementById("messageFeed");

  // Function to render a single message card
  function renderMessageCard(message) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.textContent = message;
    messageFeedElement.appendChild(card);
  }

  // Function to display messages in the message feed
  async function displayMessages() {
    const messages = await retrieveMessages();

    // Render the first 25 messages in the message feed
    const initialMessages = messages.slice(0, 25);
    initialMessages.forEach(renderMessageCard);
  }

  // Call the displayMessages function to initiate the display of messages
  displayMessages();
});
