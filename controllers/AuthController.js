const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const login = email?.toLowerCase();

    // 1. Check if login input is provided
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // 2. Find user by email or username
    const user = await User.findOne({
      $or: [{ email: login }, { username: login }]
    }).select("+password"); // In case password select: false hai schema me

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // 3. Compare password safely
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // 4. Generate JWT Token (Fall back key given if process.env.JWT_SECRET is missing)
    const secretKey = process.env.JWT_SECRET || "fallback_secret_key_123";
    const token = jwt.sign(
      { userId: user._id },
      secretKey,
      { expiresIn: "7d" }
    );

    // Remove password before sending response
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userResponse
    });

  } catch (error) {
    // Is Line se terminal par ACTUAL ERROR PRINT hoga
    console.error("EXACT SIGNIN ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = { signin };