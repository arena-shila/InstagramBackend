const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const User = require("../models/User");

const generateToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

router.post("/signin", async (req, res) => {
  const { login, email, password } = req.body;
  const loginValue = login || email;

  if (!loginValue || !password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    let query;

    if (/^\d+$/.test(loginValue)) {
      query = { phone: loginValue };
    } else if (loginValue.includes("@")) {
      query = { email: loginValue.toLowerCase() };
    } else {
      query = { username: loginValue.toLowerCase() };
    }

    const foundUser = await User.findOne(query).select("+password");

    if (!foundUser) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    let isMatch = false;
    if (foundUser.password && foundUser.password.startsWith("$2")) {
      isMatch = await foundUser.comparePassword(password);
    } else {
      isMatch = foundUser.password === password;
      if (isMatch) {
        foundUser.password = await require("bcrypt").hash(password, 10);
        await foundUser.save();
      }
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(foundUser);
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: foundUser._id,
        name: foundUser.name,
        username: foundUser.username,
        email: foundUser.email,
        avatar: foundUser.avatar,
        phone: foundUser.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(409).json({ success: false, message: "All fields are required" });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(409).json({ success: false, message: "Phone number already registered" });
    }

    const newUser = new User({
      name,
      username: name.toLowerCase().replace(/\s+/g, "_") + "_" + Math.floor(Math.random() * 1000),
      email: email.toLowerCase(),
      phone,
      password,
    });

    await newUser.save();

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    console.log("SIGNUP ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;