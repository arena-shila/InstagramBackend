const { Server } = require("socket.io");

let io;
const onlineUsers = {};

const initSocket = (server) => {
  const allowedOrigins = (process.env.CLIENT_ORIGIN || "https://instagramfrontend-7.onrender.com")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  }); 


  io.on("connection", (socket) => {
    console.log("Connected socket ID:", socket.id);

    socket.on("join", (userId) => {
      if (!userId) return;
      onlineUsers[userId] = socket.id;
      console.log(`User joined: ID = ${userId}, Socket = ${socket.id}`);
      io.emit("onlineUsers", Object.keys(onlineUsers));
    });

    socket.on("privateMessage", ({ sender, receiver, message }) => {
      const receiverSocketId = onlineUsers[receiver];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", {
          sender,
          receiver,
          message,
          _id: Date.now(),
        });
      } else {
        console.log(`User ${receiver} is not found`);
      }
    });

    // Jab receiver chat khole ya message dekh le, sender ko "seen" batayein
    socket.on("markAsSeen", ({ senderId, receiverId }) => {
      if (!senderId || !receiverId) return;
      const senderSocketId = onlineUsers[senderId];
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesMarkedAsSeen", {
          receiverId, // jisne dekha (yeh currentUser hai jo sender ke liye "receiver" tha)
        });
      }
    });

    socket.on("disconnect", () => {
      for (const userId in onlineUsers) {
        if (onlineUsers[userId] === socket.id) {
          delete onlineUsers[userId];
          break;
        }
      }
      io.emit("onlineUsers", Object.keys(onlineUsers));
    });
  });

  return io;
};

// Agar kisi controller ya route me socket ki zaroorat ho toh is function se mil jayega
const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO initialized nahi hua hai!");
  }
  return io;
};

const getReceiverSocketId = (userId) => onlineUsers[userId?.toString()];
module.exports = { initSocket, getIO, getReceiverSocketId };
