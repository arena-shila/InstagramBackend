const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const path = require("path");
const { initSocket } = require("./socket");

const app = express();
dotenv.config({ path: path.join(__dirname, ".env") });

const { connectDB } = require("./Config/db");
const messageRoutes = require("./Route/message");
const postRoutes = require("./Route/post");
const userRoutes = require("./Route/user");
const authRoutes = require("./Route/Auth");
const notificationRoutes = require("./Route/notification")

const contactRoutes = require("./Route/Contact");

const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

 const io = initSocket(server);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json());

connectDB();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notification", notificationRoutes)
app.use("/api/contact", contactRoutes);

app.get("/", (req, res) => res.send("Server is running"));




server.listen(PORT, "0.0.0.0", () => {
  console.log(`server is running on port ${PORT}`);
});

module.exports = { app, server, io };