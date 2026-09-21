const Message = require("../models/Message");

exports.sendMessage = async (req, res) => {
  try {
    const { receiver, message } = req.body;

    const newMessage = await Message.create({
      sender: req.user.id,   // from auth middleware
      receiver,
      message,
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: userId },
        { sender: userId, receiver: req.user.id },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
