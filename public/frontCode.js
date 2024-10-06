const socket = io();

const messages = document.getElementById("messages");
const input = document.getElementById("message-input");
const usernameInput = document.getElementById("username-input");
const sendBtn = document.getElementById("send-btn");
const username_box = document.getElementById("username-box");
const userColors = {};
const messageTone = new Audio("music/gun-gunshot-01.mp3");

let username = "";
let replyTo = null;

const badWords = [
  "chutiya",
  "bhenchod",
  "madarchod",
  "gandu",
  "harami",
  "lanat",
  "kutti",
  "kutta",
  "kanjar",
  "haraami",
  "bastard",
  "fuck",
  "sex",
  "lanti",
  "beghairat",
  "jahil",
  "ullu",
  "ullu ka pattha",
  "pagal",
  "bakwas",
  "bewaqoof",
  "gadha",
  "bitch",
];

function filterBadWords(message) {
  let filteredMessage = message;
  badWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    filteredMessage = filteredMessage.replace(regex, "***");
  });
  return filteredMessage;
}

usernameInput.addEventListener("change", () => {
  username = usernameInput.value.trim();
});

sendBtn.addEventListener("click", () => {
  let message = input.value.trim();

  if (!username) {
    alert("Please enter your name before sending a message!");
    return;
  }

  if (message) {
    if (replyTo) {
      message = `${message}`; // Only the message, no username included
      replyTo = null; // Reset reply after sending
    }

    message = filterBadWords(message);
    socket.emit("chat message", { username, message, replyTo });
    input.value = "";
    username_box.style.display = "none";
  } else {
    alert("Please enter a message!");
  }
});

socket.on("chat message", (data) => {
  const li = document.createElement("li");
  const userColor = userColors[data.username] || getRandomColor();
  userColors[data.username] = userColor;

  if (data.username === username) {
    li.innerHTML = `<i>${data.message}</i>`;
    li.classList.add("sent");
  } else {
    const replyPrefix = data.replyTo
      ? `<span style="color: light-blue;">@${data.replyTo}</span>: `
      : "";
    li.innerHTML = `<strong style="color: ${userColor};">${
      data.username
    }</strong> <img width="15" height="15" src="https://img.icons8.com/ios/50/voice-recognition-scan.png" alt="voice-recognition-scan"/> <i>${replyPrefix}${highlightMentions(
      data.message
    )}</i>`;
    li.classList.add("received");
    messageTone.play();

    li.addEventListener("click", () => {
      replyTo = data.username; // Set replyTo to the username of the message clicked
      input.value = `@${replyTo} `; // Populate the input with the mention
      input.focus();
    });
  }

  messages.appendChild(li);
  window.scrollTo(0, document.body.scrollHeight);
});

input.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    sendBtn.click();
  }
});

function highlightMentions(message) {
  const regex = /@(\w+)/g;
  return message.replace(
    regex,
    '<span style="color: blue; font-weight: bold;">@$1</span>'
  );
}

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
