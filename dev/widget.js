(async function () {
  const TOGGLE_CHATWIDGET_ID = "toggleChatwidget";

  const INITIAL_MESSAGES_POPUP_ID = "initialMessagesPopup";

  const CLOSE_INITIAL_MESSAGES_POPUP_ID = "closeInitialMessagesPopup";

  const INITIAL_MESSAGES_POPUP_REMOVED_KEY = "initialMessagesPopupRemoved";

  const CHAT_WIDGET_POPUP_SHOWN_KEY = "chatWidgetPopupShown";

  const CHAT_ICON_ID = "chatIcon";

  const CHAT_WIDGET_IFRAME_ID = "chatWidgetIframe";

  const CHATBOT_EMBED_URL = "/chatbot/embed/";

  const GET_CHATWIDGET_DATA_API_URL = "/chatbot/api/chatwidget/";

  const scriptElement = document.currentScript;

  const chatbotUUID = scriptElement.getAttribute("data-id");

  const domain =
    scriptElement.getAttribute("data-domain") ||
    scriptElement.getAttribute("data-stammer-domain");

  // API call to get some chatbot's/chatwidget's data

  const data = await getChatwidgetData(chatbotUUID);

  const iconImg = data.chat_bubble_img;

  const iconClose = data.close;

  const defaultIcon = data.default_icon || false;

  const iconColor = data.chat_bubble_color || "#DAE7FB";

  const iconTextColor = data.user_msg_text_color || "#69707A";

  const initialMessages = data.initial_messages || [];

  const popupType = data.popup_type;

  const initialMessagePopupDelay = data.initial_message_popup_delay;

  const chatwidgetPopupDelay = data.chatwidget_popup_delay;

  const initialPopupMessageFontFamily = data.font_family;

  const initialPopupMessageFontSize = data.font_size;

  let isInitialMessagesPopupShowing = false;

  // Add the chat bubble styles/CSS to the head of the document

  const styleElement = document.createElement("style");

  styleElement.textContent = getChatbubbleStyles();

  document.head.appendChild(styleElement);

  // Add the chat bubble HTML to the body of the document

  document.body.insertAdjacentHTML("beforeend", getChatbubbleHTML());

  // Create an iframe element for chat widget

  const chatWidget = getChatWidgetIframe();

  document.body.appendChild(chatWidget);

  // Add event listener for the chat bubble click

  document
    .getElementById(TOGGLE_CHATWIDGET_ID)
    .addEventListener("click", toggleChatWidgetIframe);

  // if statement to show popup for either initial message or chatwidget

  if (popupType === "initial_messages_popup") {
    showInitialMessagesPopup(initialMessagePopupDelay, initialMessages);
  } else if (popupType === "chatwidget_popup") {
    showChatwidgetPopup(chatwidgetPopupDelay);
  }

  /**

     * Returns HTML for the chat icon image.

     */

  function getChatIconImgHTML() {
    if (defaultIcon) {
      return `<img style="display: block; height: 18px; margin: auto;" width="30px" src="${iconImg}" alt="">`;
    }

    return `<img style="width: 58px; height: 58px; border-radius: 50%; background-size: cover; background-position: center; vertical-align: middle;" src="${iconImg}" alt="">`;
  }

  /**

     * Returns HTML for the close icon.

     */

  function getCloseIconHTML() {
    return `<img style="display: block; height: 40px; margin: auto;" width="30px" src="${iconClose}" alt="">`;
  }

  /**

     * Toggle the visibility of the chat widget iframe and update the chat icon accordingly.

     */

  function toggleChatWidgetIframe() {
    if (isInitialMessagesPopupShowing) {
      removeInitialMessagesPopup();
    }

    const CHAT_WIDGET_IFRAME_ID = "chatWidgetIframe";

    const CHAT_ICON_ID = "chatIcon";

    const chatWidget = document.getElementById(CHAT_WIDGET_IFRAME_ID);

    const chatIconElement = document.getElementById(CHAT_ICON_ID);

    if (chatWidget.style.visibility === "hidden") {
      // Show the chat widget

      chatWidget.style.zIndex = "2000";

      chatWidget.style.visibility = "visible";

      chatWidget.style.opacity = "1";

      // Remove the current chat icon image

      const chatIconImgToRemove = chatIconElement.querySelector("img");

      chatIconElement.removeChild(chatIconImgToRemove);

      chatIconElement.innerHTML = getCloseIconHTML();

      if (screen.width < 500) {
        disableBodyScroll();

        document.documentElement.scrollTop = 0; // For most browsers

        document.body.scrollTop = 0; // For Safari

        hideChatbubble();
      }
    } else {
      // Hide the chat widget

      chatWidget.style.visibility = "hidden";

      chatWidget.style.opacity = "0";

      chatWidget.style.zIndex = "-2000";

      // Remove the close icon

      const closeIconToRemove = chatIconElement.querySelector("img");

      chatIconElement.removeChild(closeIconToRemove);

      chatIconElement.innerHTML = getChatIconImgHTML();

      enableBodyScroll();
    }
  }

  window.toggleChatWidgetIframe = toggleChatWidgetIframe;

  function getChatbubbleStyles() {
    const styles = `

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

            background-color: ${iconColor};

            color: ${iconTextColor};

            transition: transform 0.1s ease-in;

        }

        /* Add the hover effect */

        .chat-bubble:hover {

            transform: scale(1.1);

        }

        `;

    return styles;
  }

  /**

     * Returns HTML for the chat bubble.

     */

  function getChatbubbleHTML() {
    const chatBubbleHtml = `
<div class="chat-bubble" id="${TOGGLE_CHATWIDGET_ID}">
<div id="${CHAT_ICON_ID}">

                ${getChatIconImgHTML()}
</div>
</div>`;

    return chatBubbleHtml;
  }

  function disableBodyScroll() {
    document.body.style.overflow = "hidden";

    document.documentElement.style.overflow = "hidden";

    // Safari specific: Disable touch scrolling by preventing default behavior

    document.addEventListener("touchmove", preventDefault, { passive: false });
  }

  function enableBodyScroll() {
    document.body.style.overflow = "";

    document.documentElement.style.overflow = "";

    // Remove the touchmove event listener

    document.removeEventListener("touchmove", preventDefault, {
      passive: false,
    });
  }

  function preventDefault(e) {
    e.preventDefault();
  }

  function hideChatbubble() {
    const toggleButton = document.getElementById(TOGGLE_CHATWIDGET_ID);

    toggleButton.style.display = "none";
  }

  function showChatbubble() {
    const toggleButton = document.getElementById(TOGGLE_CHATWIDGET_ID);

    toggleButton.style.display = "flex";
  }

  /**

     * Returns an iframe element for the chat widget.

     */

  function getChatWidgetIframe() {
    const SMALL_SCREEN_WIDTH = 650;

    const currentScreenWidth = window.innerWidth;

    const isMobileScreen = currentScreenWidth < SMALL_SCREEN_WIDTH;

    const chatWidget = document.createElement("iframe");

    chatWidget.id = CHAT_WIDGET_IFRAME_ID;

    chatWidget.allow = "microphone";

    chatWidget.style.position = "fixed";

    chatWidget.style.zIndex = "2000";

    chatWidget.style.border = "none";

    chatWidget.style.visibility = "hidden";

    chatWidget.style.opacity = "0";

    chatWidget.style.transition = "opacity 0.3s ease";

    // Helper function to set styles based on screen size

    function setChatWidgetStyles(isMobile) {
      if (isMobile) {
        chatWidget.style.width = "100%";

        chatWidget.style.height = "100%";

        chatWidget.style.top = "0";

        chatWidget.style.left = "0";

        chatWidget.style.right = "0";

        chatWidget.style.bottom = "0";

        chatWidget.style.borderRadius = "0";
      } else {
        chatWidget.style.width = "500px";

        // chatWidget.style.height = "720px";

        chatWidget.style.height = "80%";

        chatWidget.style.top = "auto";

        chatWidget.style.left = "auto";

        chatWidget.style.bottom = "100px";

        chatWidget.style.right = "20px";
      }
    }

    // Set initial styles

    setChatWidgetStyles(isMobileScreen);

    // Add resize listener to handle window changes

    window.addEventListener("resize", () => {
      const isNowMobile = window.innerWidth < SMALL_SCREEN_WIDTH;

      setChatWidgetStyles(isNowMobile);
    });

    chatWidget.src = `${domain}${CHATBOT_EMBED_URL}${chatbotUUID}`;

    return chatWidget;
  }

  // Listen for the close message from the iframe

  window.addEventListener("message", function (event) {
    if (event.data === "close-chatbubble") {
      const chatWidget = document.getElementById("chatWidgetIframe");

      const chatIconElement = document.getElementById("chatIcon");

      if (chatWidget) {
        chatWidget.style.visibility = "hidden";

        chatWidget.style.opacity = "0";

        chatWidget.style.zIndex = "-2000";

        const closeIconToRemove = chatIconElement.querySelector("img");

        if (closeIconToRemove) {
          chatIconElement.removeChild(closeIconToRemove);

          chatIconElement.innerHTML = getChatIconImgHTML();
        }

        enableBodyScroll();

        showChatbubble();
      }
    }
  });

  /**

     * Removes the initial messages popup

     */

  function removeInitialMessagesPopup(removePermanently = false) {
    if (isInitialMessagesPopupShowing) {
      isInitialMessagesPopupShowing = false;

      document.getElementById(INITIAL_MESSAGES_POPUP_ID).remove();

      if (removePermanently) {
        setLocalStorageItem(INITIAL_MESSAGES_POPUP_REMOVED_KEY, true);
      }
    }
  }

  /**

     * Displays the initial messages popup, if needed.

     */

  function showInitialMessagesPopup(delay, initialMessages) {
    // if delay is negative OR local storage item for popup removal is set

    // then don't show the popup.

    if (
      delay < 0 ||
      getLocalStorageItem(INITIAL_MESSAGES_POPUP_REMOVED_KEY) == "true"
    ) {
      return;
    }

    // Add the initial messages popup styles to the head of the document

    const styleElement = document.createElement("style");

    styleElement.textContent = getInitialMessagesPopupStyles();

    document.head.appendChild(styleElement);

    // Add the initial messages HTML to the body of the document

    const popupHTML = getInitialMessagesPopupHTML(initialMessages);

    document.body.insertAdjacentHTML("beforeend", popupHTML);

    // Function to add the active class to each message

    function activateMessages() {
      const popup = document.querySelector(".initial-messages-popup");

      const messages = document.querySelectorAll(".initial-message");

      if (popup) {
        popup.classList.add("active");

        messages.forEach((message, index) => {
          // Delay the animation for each message

          setTimeout(() => {
            message.classList.add("active");
          }, index * 500); // Delay time between messages
        });
      }
    }

    // Trigger the popup and messages to appear after the specified delay

    setTimeout(activateMessages, delay * 1000);

    // Add event listener for the initial messages click to toggle chatwidget

    document
      .getElementById(INITIAL_MESSAGES_POPUP_ID)
      .addEventListener("click", toggleChatWidgetIframe);

    // Add event listener for the remove/close icon to permanently remove the popup

    document
      .getElementById(CLOSE_INITIAL_MESSAGES_POPUP_ID)
      .addEventListener("click", function (event) {
        event.stopPropagation(); // Prevent the click event from propagating to parent elements

        removeInitialMessagesPopup(true);
      });

    // setting this flag to true as it will be checked if we want to remove the popup.

    isInitialMessagesPopupShowing = true;
  }

  function showChatwidgetPopup(delay) {
    // Check if the chatwidget popup has already been show from session storage

    if (getSessionStorageItem(CHAT_WIDGET_POPUP_SHOWN_KEY) === "true") {
      return;
    }

    if (delay >= 0) {
      setTimeout(() => {
        toggleChatWidgetIframe();

        // Set the chatwidget popup as shown in session storage

        setSessionStorageItem(CHAT_WIDGET_POPUP_SHOWN_KEY, "true");
      }, delay * 1000);
    }
  }

  function getInitialMessagesPopupStyles() {
    const styles = `

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

            position: relative; /* Needed for absolute positioning of the close button */

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

        .close-button:hover {

            color: #777;

        }

        .initial-messages-popup.active {

            opacity: 1;

            visibility: visible;

        }

        .initial-message.active {

            transform: translateY(0);

            opacity: 1;

        }

        `;

    return styles;
  }

  /**

     * Returns the HTML of initial messages popup

     */

  function getInitialMessagesPopupHTML(initialMessages) {
    // The close button is now separate from the messages

    let closeButtonHTML = `<div class="close-button" id="${CLOSE_INITIAL_MESSAGES_POPUP_ID}">&times;</div>`;

    let messagesHTML = initialMessages
      .map(
        (message) =>
          `<div class="initial-message" style="font-size: ${initialPopupMessageFontSize}; font-family: ${initialPopupMessageFontFamily};">${message}</div>`
      )
      .join("");

    const initialMessagesPopupHTML = `
<div class="initial-messages-popup" id="${INITIAL_MESSAGES_POPUP_ID}">

            ${closeButtonHTML}

            ${messagesHTML}
</div>`;

    return initialMessagesPopupHTML;
  }

  /**

     * Fetches some of the chatbot's data via API and returns it.

     */

  async function getChatwidgetData(chatbotUUID) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      const URL = `${domain}${GET_CHATWIDGET_DATA_API_URL}${chatbotUUID}/`;

      xhr.open("GET", URL, true);

      xhr.setRequestHeader("Content-Type", "application/json");

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);

            resolve(data);
          } else {
            console.log(xhr.responseText);

            reject("Something went wrong while fetching chatwidget's data.");
          }
        }
      };

      xhr.send();
    });
  }

  /**

     * Sets a value for a given key in the local storage.

     */

  function setLocalStorageItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error("Error saving to localStorage", error);
    }
  }

  /**

     * Retrieves a value from local storage by its key.

     */

  function getLocalStorageItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error("Error retrieving from localStorage", error);

      return null;
    }
  }

  /**

     * Sets a value for a given key in session storage 

     */

  function setSessionStorageItem(key, value) {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.log("Error saving to sessionStorage", error);
    }
  }

  /**

     * Retrieves a value from session storage by its key 

     */

  function getSessionStorageItem(key) {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.log("Error retrieving from sessionStorage", error);

      return null;
    }
  }
})();
