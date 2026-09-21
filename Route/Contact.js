const express = require("express");
const Contact = require("../models/Contact_Schema");
const authmiddleware = require("../Middleware/authmiddleware");

const router = express.Router();

router.post("/", authmiddleware, async (req, res) => {
  try {
    const { name, topic, message } = req.body;
    const contact = await Contact.create({
      user: req.userId,
      name: name || "",
      topic,
      message,
    });
    res.status(201).json({ success: true, message: "Message sent. Thank you!", contact });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;