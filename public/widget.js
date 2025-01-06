(function () {
  // Create and inject styles
  const style = document.createElement("style");
  style.textContent = `
    .chat-bubble {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
      z-index: 2000;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: white;
      transition: transform 0.1s ease-in;
    }

    .chat-bubble:hover {
      transform: scale(1.1);
    }

    .chatbot-window {
      position: fixed;
      bottom: 100px;
      right: 20px;
      width: 500px;
      height: 80%;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      display: none;
      flex-direction: column;
      z-index: 2000;
      transition: opacity 0.3s ease, visibility 0.3s ease;
      visibility: hidden;
      opacity: 0;
    }

    @media (max-width: 650px) {
      .chatbot-window {
        width: 100%;
        height: 100%;
        bottom: 0;
        right: 0;
        border-radius: 0;
      }
    }

    .chatbot-window.active {
      visibility: visible;
      opacity: 1;
    }

    .initial-messages-popup {
      position: fixed;
      bottom: 80px;
      right: 20px;
      width: auto;
      background-color: transparent;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      z-index: 2000;
      cursor: pointer;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.5s, visibility 0.5s;
    }

    .initial-message {
      color: black;
      background-color: white;
      margin-bottom: 15px;
      padding: 20px;
      width: 100%;
      border-radius: 10px;
      transform: translateY(20px);
      opacity: 0;
      transition: transform 0.5s, opacity 0.5s;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      border: 1px solid #ddd;
      position: relative;
    }

    .close-button {
      position: absolute;
      top: -15px;
      right: -10px;
      font-size: 25px;
      color: #AAA;
      cursor: pointer;
      background-color: white;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      z-index: 2100;
    }

    .chatbot-header {
      padding: 20px;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: white;
      border-radius: 16px 16px 0 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .chatbot-messages {
      flex-grow: 1;
      overflow-y: auto;
      padding: 20px;
      scroll-behavior: smooth;
    }

    .chatbot-input {
      padding: 20px;
      border-top: 1px solid #e2e8f0;
      background: #f8fafc;
    }

    .message {
      margin: 8px 0;
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 0.95rem;
      line-height: 1.5;
      position: relative;
    }

    .user-message {
      background: #f1f5f9;
      color: #1e293b;
      margin-left: auto;
      border-bottom-right-radius: 4px;
    }

    .bot-message {
      background: #eff6ff;
      color: #1e293b;
      margin-right: auto;
      border-bottom-left-radius: 4px;
    }
  `;
  document.head.appendChild(style);

  class ChatbotWidget {
    constructor(botId) {
      this.botId = botId;
      this.isInitialMessagesPopupShowing = false;
      this.createWidget();
      this.setupStorageHandlers();
    }

    createWidget() {
      const widget = document.createElement("div");
      widget.className = "chat-bubble";
      widget.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>`;

      const chatWindow = this.createChatWindow();

      widget.onclick = () => this.toggleChat();

      document.body.appendChild(widget);
      document.body.appendChild(chatWindow);

      this.chatBubble = widget;
      this.chatWindow = chatWindow;
      this.messagesContainer = chatWindow.querySelector(".chatbot-messages");

      // Show initial welcome message after a delay
      setTimeout(() => {
        this.showInitialMessages();
      }, 2000);
    }

    createChatWindow() {
      const chatWindow = document.createElement("div");
      chatWindow.className = "chatbot-window";
      chatWindow.innerHTML = `
        <div class="chatbot-header">
          <div class="chatbot-header-title">Chat Support</div>
          <div class="chatbot-header-status">
            <div class="status-indicator"></div>
            <span>Online</span>
          </div>
        </div>
        <div class="chatbot-messages"></div>
        <div class="chatbot-input">
          <div class="chatbot-input-container">
            <input type="text" placeholder="Type your message...">
            <button>Send</button>
          </div>
        </div>
      `;

      this.setupEventListeners(chatWindow);
      return chatWindow;
    }

    setupEventListeners(chatWindow) {
      const input = chatWindow.querySelector("input");
      const sendButton = chatWindow.querySelector("button");

      const sendMessage = () => {
        const message = input.value.trim();
        if (message) {
          this.sendMessage(message);
          input.value = "";
        }
      };

      sendButton.onclick = sendMessage;
      input.onkeypress = (e) => {
        if (e.key === "Enter") sendMessage();
      };
    }

    setupStorageHandlers() {
      this.setSessionStorageItem = (key, value) => {
        try {
          sessionStorage.setItem(key, value);
        } catch (error) {
          console.error("Error saving to sessionStorage", error);
        }
      };

      this.getSessionStorageItem = (key) => {
        try {
          return sessionStorage.getItem(key);
        } catch (error) {
          console.error("Error retrieving from sessionStorage", error);
          return null;
        }
      };
    }

    showInitialMessages() {
      const messages = ["👋 Hey there!", "How can I help you today?"];
      const popup = document.createElement("div");
      popup.className = "initial-messages-popup";

      messages.forEach((message) => {
        const messageDiv = document.createElement("div");
        messageDiv.className = "initial-message";
        messageDiv.textContent = message;
        popup.appendChild(messageDiv);
      });

      const closeButton = document.createElement("div");
      closeButton.className = "close-button";
      closeButton.innerHTML = "&times;";
      closeButton.onclick = (e) => {
        e.stopPropagation();
        popup.remove();
        this.setSessionStorageItem("initial-messages-shown", "true");
      };

      popup.appendChild(closeButton);
      document.body.appendChild(popup);

      // Trigger animation
      setTimeout(() => {
        popup.style.opacity = "1";
        popup.style.visibility = "visible";
        popup.querySelectorAll(".initial-message").forEach((msg, index) => {
          setTimeout(() => {
            msg.style.opacity = "1";
            msg.style.transform = "translateY(0)";
          }, index * 500);
        });
      }, 100);
    }

    toggleChat() {
      const isVisible = this.chatWindow.classList.contains("active");

      if (!isVisible) {
        this.chatWindow.style.display = "flex";
        setTimeout(() => {
          this.chatWindow.classList.add("active");
        }, 0);
      } else {
        this.chatWindow.classList.remove("active");
        setTimeout(() => {
          this.chatWindow.style.display = "none";
        }, 300);
      }
    }

    async sendMessage(message) {
      // Add user message
      this.addMessage(message, "user");

      try {
        // Send to backend
        const response = await fetch(
          `http://localhost:3000/api/chat/${this.botId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ message }),
          }
        );

        const data = await response.json();

        // Add bot response
        setTimeout(() => {
          this.addMessage(data.response, "bot");
        }, 1000);
      } catch (error) {
        console.error("Error:", error);
        this.addMessage(
          "Sorry, I encountered an error. Please try again later.",
          "bot"
        );
      }
    }

    addMessage(message, type) {
      const messageDiv = document.createElement("div");
      messageDiv.className = `message ${type}-message`;
      messageDiv.textContent = message;
      this.messagesContainer.appendChild(messageDiv);
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }

  // Initialize widget
  const script = document.currentScript;
  const botId = script.getAttribute("data-bot-id") || "default";
  window.chatbotWidget = new ChatbotWidget(botId);
})();
