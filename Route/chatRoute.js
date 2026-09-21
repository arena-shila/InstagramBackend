

const express = require("express");
const authmiddleware = require("../Middleware/authmiddleware");
const Message = require("../models/Message_Schema");

const router = express.Router();

// Corrected Chat Route
router.post("/send", authmiddleware, async (req, res) => {
  const { receiverId, message } = req.body;
  try {
    const newMessage = new Message({ // Fixed: message -> Message
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

router.get("/chat/:otherUserId", authmiddleware, async (req, res) => { // Fixed: / missed[cite: 9]
  try {
    const { otherUserId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: req.userId, receiver: otherUserId }, // Fixed: UserId -> req.userId[cite: 9]
        { sender: otherUserId, receiver: req.userId },
      ],
      
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch message" });
  }
});
module.exports = router;