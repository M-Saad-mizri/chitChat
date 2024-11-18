const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Store connected users and message history
let users = [];
let messageHistory = [];

// Function to convert URLs into clickable links
function makeLinksClickable(message) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return message.replace(
    urlRegex,
    (url) => `<a href="${url}" target="_blank">${url}</a>`
  );
}

// Handle socket connections
io.on("connection", (socket) => {
  console.log("New user connected");

  // Send the existing list of users to the new client
  socket.emit("user list", users);

  // Send existing message history to the new user
  socket.emit("message history", messageHistory);

  // Add user to the connected users list
  socket.on("add user", (username) => {
    if (!users.includes(username)) {
      users.push(username);
      socket.username = username;  // Store the username in socket object
      io.emit("user list", users); // Notify all clients of the new user
    }
  });

  // Handle new chat messages
  socket.on("chat message", (data) => {
    const { username, message, replyTo } = data;
    const formattedMessage = makeLinksClickable(message); // Convert links to clickable
    const timestamp = new Date().toLocaleTimeString(); // Get current time as a timestamp

    // Create message object with timestamp
    const messageObject = {
      username,
      message: formattedMessage,
      replyTo,
      timestamp,
    };
    messageHistory.push(messageObject); // Store the message in history

    // Emit the formatted message to all connected clients
    io.emit("chat message", messageObject);
  });

  // User disconnects
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.username}`);

    // Remove user from the list (if they were in the list)
    if (socket.username) {
      users = users.filter((user) => user !== socket.username);
      console.log(`Remaining Users: ${users}`); // Log remaining users
    }

    // Emit the updated user list to all clients
    io.emit("user list", users);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
