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
  "bhnchod",
  "madarchod",
  "madrchod",
  "gandu",
  "gando",
  "gand",
  "harami",
  "lanat",
  "kutti",
  "kutta",
  "kanjar",
  "haraami",
  "bastard",
  "fuck",
  "sex",
  "sexy",
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
  "mc",
  "bc",
  "suar",
  "hijra",
  "chakka",
  "haraamzada",
  "kaafir",
  "paagal",
  "ghatiya",
  "kamina",
  "khabees",
  "lafanga",
  "nalayak",
  "namard",
  "nalayak",
  "zaalim",
  "zaleel",
  "Chut",
  "raand",
  "kutti ka bachha",
  "badmaash",
  "chor",
  "chirkut",
  "badtameez",
  "bewafa",
  "jhant",
  "chamaar",
  "badtameez",
  "chichora",
  "chudail",
  "fingering",
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
  socket.emit("add user", username); // Notify server of new user
});

// Send message when clicking 'Send' button
sendBtn.addEventListener("click", () => {
  let message = input.value.trim();

  if (!username) {
    alert("Please enter your name before sending a message!");
    return;
  }

  if (message) {
    if (replyTo) {
      message = `${message}`;
      replyTo = null;
    }

    message = filterBadWords(message);
    socket.emit("chat message", { username, message, replyTo });
    input.value = ""; // Clear the message input after sending
    username_box.style.display = "none"; // Hide username input box after first message
  } else {
    alert("Please enter a message!");
  }
});

// Send message by pressing "Enter" key
input.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    sendBtn.click(); // Trigger the send button click event
  }
});

// Receive and display chat messages
socket.on("chat message", (data) => {
  const li = document.createElement("li");
  const userColor = userColors[data.username] || getRandomColor();
  userColors[data.username] = userColor;

  const usernameSpan = document.createElement("strong");
  usernameSpan.style.color = userColor;
  usernameSpan.style.textTransform = "capitalize";
  usernameSpan.style.cursor = "pointer";
  usernameSpan.textContent = data.username;

  // Add transition effect for hover
  usernameSpan.style.transition = "color 0.3s ease, transform 0.3s ease";

  // Add hover effect for color and scale transformation
  usernameSpan.addEventListener("mouseover", () => {
    usernameSpan.style.backgroundColor = "#3498db"; // Change color on hover
    usernameSpan.style.color = "black"; // Change color on hover
    usernameSpan.style.padding = "2px";
  });

  usernameSpan.addEventListener("mouseout", () => {
    usernameSpan.style.color = userColor; // Reset to original color
    usernameSpan.style.backgroundColor = "transparent";
  });
  const hr = document.createElement("hr");

  // Add click event to the username to reply
  usernameSpan.addEventListener("click", (e) => {
    replyTo = data.username;
    input.value = `@${replyTo} `; // Populate input with the mentioned username
    input.focus(); // Focus on the input box
  });

  // Create timestamp span
  const timestampSpan = document.createElement("span");
  timestampSpan.textContent = data.timestamp;
  timestampSpan.style.fontSize = "0.8em"; // Smaller font size for timestamp
  timestampSpan.style.color = "gray"; // Color for timestamp

  // Create message content with italic styling
  const messageContent = document.createElement("span");
  messageContent.style.fontStyle = "italic";
  messageContent.innerHTML = highlightMentions(data.message);

  // Add spaces before and after the SVG icon
  const spaceBeforeSVG = document.createTextNode(" ");

  // If the message is from the current user, style it differently
  if (data.username === username) {
    li.classList.add("sent");
  } else {
    const replyPrefix = data.replyTo
      ? `<span style="color: light-blue;">@${data.replyTo}</span>: `
      : "";
    messageContent.innerHTML = `${replyPrefix}${highlightMentions(
      data.message
    )}`;
    li.classList.add("received");
    messageTone.play();
  }

  // Append elements to the list item: username, timestamp, space, SVG, space, and message
  li.appendChild(usernameSpan);
  li.appendChild(spaceBeforeSVG);
  li.appendChild(timestampSpan);
  li.appendChild(hr);
  li.appendChild(messageContent);

  // Prevent click event on links from triggering username reply mention
  li.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  });

  messages.appendChild(li);
  window.scrollTo(0, document.body.scrollHeight);
});

// Receive and display message history
socket.on("message history", (history) => {
  history.forEach((data) => {
    const li = document.createElement("li");
    const userColor = userColors[data.username] || getRandomColor();
    userColors[data.username] = userColor;

    // Create the username span
    const usernameSpan = document.createElement("strong");
    usernameSpan.style.color = userColor;
    usernameSpan.textContent = data.username;

    // Add click event to the username to reply
    usernameSpan.addEventListener("click", (e) => {
      replyTo = data.username;
      // input.value = `@${replyTo} `; // Populate input with the mentioned username
      input.focus(); // Focus on the input box
    });

    // Create timestamp span
    const timestampSpan = document.createElement("span");
    timestampSpan.textContent = data.timestamp;
    timestampSpan.style.fontSize = "0.8em"; // Smaller font size for timestamp
    timestampSpan.style.color = "gray"; // Color for timestamp

    // Create message content
    const messageContent = document.createElement("span");
    messageContent.style.fontStyle = "italic";
    messageContent.innerHTML = highlightMentions(data.message);

    // Append elements to the list item: username, timestamp, and message
    li.appendChild(usernameSpan);
    li.appendChild(timestampSpan);
    li.appendChild(messageContent);
    messages.appendChild(li);
  });
});

// Function to highlight @mentions
function highlightMentions(message) {
  const regex = /@(\w+)/g;
  return message.replace(
    regex,
    '<span style="color: blue; font-weight: bold;">@$1</span>'
  );
}

// Function to generate random colors for usernames
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
// Listen for the initial user list when the client connects
socket.on("user list", (users) => {
  const userList = document.getElementById("user-list");
  userList.innerHTML = ""; // Clear existing list
  users.forEach((user) => {
    const li = document.createElement("li");
    li.textContent = user;
    userList.appendChild(li);
  });
});
// Listen for when the user list updates (e.g., someone disconnects)
socket.on("user list", (users) => {
  const userList = document.getElementById("user-list");
  userList.innerHTML = ""; // Clear the list
  let totalUsers = 0
  users.forEach((user) => {
    const li = document.createElement("li");
    li.textContent = user;
    userList.appendChild(li);
    totalUsers += 1
    document.getElementById("total-users").innerText = totalUsers
  });
});
const toggleButton = document.getElementById("toggle-button");
const userPanel = document.getElementById("user-panel");

toggleButton.addEventListener("click", () => {
  userPanel.classList.toggle("open");

  // Toggle button text between ">" and "<"
  if (userPanel.classList.contains("open")) {
    toggleButton.textContent = "<"; // When the panel is open, change to "<"
  } else {
    toggleButton.textContent = ">"; // When the panel is closed, change to ">"
  }
});

// socket.emit("add user", "JohnDoe");
// socket.emit("add user", "JohnDoe1");
// socket.emit("add user", "JohnDoe2");
// socket.emit("add user", "JohnDoe3");
// socket.emit("add user", "JohnDoe4");
// socket.emit("add user", "JohnDoe5");
// socket.emit("add user", "JohnDoe6");
// socket.emit("add user", "JohnDoe7");
// socket.emit("add user", "JohnDoe8");
// socket.emit("add user", "JohnDoe9");
// socket.emit("add user", "JohnDoe10");
// socket.emit("add user", "JohnDoe11");
// socket.emit("add user", "JohnDoe12");
// socket.emit("add user", "JohnDoe13");
// socket.emit("add user", "JohnDoe14");
// socket.emit("add user", "JohnDoe15");
// socket.emit("add user", "JohnDoe16");
// socket.emit("add user", "JohnDoe17");
// socket.emit("add user", "JohnDoe18");
// socket.emit("add user", "JohnDoe19");
// socket.emit("add user", "JohnDo20");
// socket.emit("add user", "JohnDoe21");
// socket.emit("add user", "JohnDoe22");

// backpoint
