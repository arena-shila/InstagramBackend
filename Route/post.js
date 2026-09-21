const express = require("express");
const router = express.Router();
const Post = require("../models/post_Schema");
const User = require("../models/User");
const authmiddleware = require("../Middleware/authmiddleware");
const upload = require("../Middleware/upload");
const { saveUpload } = require("../Services/mediaStorage");
const { createnotification } = require("../Services/notificationService");

router.post("/create", authmiddleware,
  upload.single("file"), async (req, res) => {
    
      try {
      console.log("req.body:", req.body);
       console.log("req.file:", req.file);
        console.log("req.userId:", req.userId);
         console.log("req.user:", req.user);

      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "Media file is required",

           });
      }
      const userId = req.userId || req.user?._id || req.user?.id;
      if(!userId){
        return res.status(401).json({success: false, message: "user not loggedin"})
      }
    

      const isVideo = req.file.mimetype.startsWith("video/");
      const mediaType = req.body.mediaType || (isVideo ? "video" : "image");
      const mediaPath = await saveUpload(req);

      
      const newPost = new Post({
        user: req.userId,
        caption: req.body.caption || "",
        media: mediaPath,
        mediaUrl: mediaPath,
        image: mediaPath,
        mediaType,
      });

      await newPost.save();
     const populatedPost = await Post.findById(newPost._id).populate(
        "user",
        "username name avatar"
      );

      return res.status(201).json({ success: true, post: populatedPost });
    } catch (error) {
      console.error(" Create Post Database Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  });




router.get("/feed", authmiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const followingIds = [...currentUser.following, req.userId];
    const posts = await Post.find({ user: { $in: followingIds } })
      .populate("user", "username name avatar")
      .populate("comments.user", "username avatar")
      .sort({ createdAt: -1 });

    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/like/:id", authmiddleware, async (req, res) => {
  try {
    const postItem = await Post.findById(req.params.id);
    if (!postItem) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    const hasLiked = postItem.likes.some((id) => id.toString() === req.userId);

    if (hasLiked) {
      postItem.likes = postItem.likes.filter(
        (id) => id.toString() !== req.userId,
      );
    } else {
      postItem.likes.push(req.userId);
    }

    await postItem.save();

    if (!hasLiked) {
      await createnotification({
        recipient: postItem.user,
        sender: req.userId,
        type: "like",
        post: postItem._id,
      });
    }
    res.json({ success: true, likes: postItem.likes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/comment/:id", authmiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res
        .status(400)
        .json({ success: false, message: "Comment text is required" });
    }

    const postItem = await Post.findById(req.params.id);
    if (!postItem) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    postItem.comments.push({ user: req.userId, text });
    await postItem.save();

    await postItem.populate("comments.user", "username avatar");

    await createnotification({
  recipient: postItem.user,
  sender: req.userId,
  type: "comment",
  post: postItem._id,
  text,
});

    res.json({ success: true, comments: postItem.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
