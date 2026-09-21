const express = require("express");

const authmiddleware = require("../Middleware/authmiddleware");
const Message = require("../models/Message_Schema");
const User = require("../models/User");

const router = express.Router();

router.post("/send", authmiddleware, async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    if (!receiverId || !message) {
      return res.status(400).json({ error: "receiverId and message are required" });
    }

    const newMessage = new Message({
      sender: req.userId,
      receiver: receiverId,
      message,
    });
    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

router.get("/allUsers", authmiddleware, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } }).select("_id username name avatar");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.get("/chat/:otherUserId", authmiddleware, async (req, res) => {
  try {
    const { otherUserId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: req.userId, receiver: otherUserId },
        { sender: otherUserId, receiver: req.userId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

module.exports = router;