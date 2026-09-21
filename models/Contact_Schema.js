const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, trim: true, maxlength: 100, default: "" },
    topic: {
      type: String,
      enum: ["Report a problem", "Account help", "Feedback / suggestion", "Something else"],
      required: true,
    },
    message: { type: String, required: true, trim: true, minlength: 10, maxlength: 1000 },
    status: { type: String, enum: ["new", "read", "resolved"], default: "new" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);