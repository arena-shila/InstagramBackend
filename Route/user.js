const express = require("express");
const User = require("../models/User");
const upload = require("../Middleware/upload");
const authmiddleware = require("../Middleware/authmiddleware");

const router = express.Router();

router.get("/", authmiddleware, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } }).select(
      "_id username name avatar followers"
    );

    const withFollowStatus = users.map((u) => ({
      _id: u._id,
      username: u.username,
      name: u.name,
      avatar: u.avatar,
      isFollowing: u.followers.some((id) => id.toString() === req.userId), 
        }));

    res.json(withFollowStatus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// alluser

router.get("/allusers", authmiddleware, async(req, res) =>{
  try{
    const users = await User.find({
      _id: {$ne: req.userId}
    }).select("_id  username name avatar followers");
    const withFollowStatus = users.map((u) => ({
      _id: u._id,
      username: u.username,
      name: u.name,
      avatar: u.avatar,
      isFollowing: u.followers.some((id) => id.toString() === req.userId), // ✅
    }));

    res.json(withFollowStatus);
  } catch (err){
    res.status(500).json({ message: err.message });
  }
})

router.post("/avatar", authmiddleware, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const avatarPath = `/uploads/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { avatar: avatarPath },
      { new: true }
    ).select("-password");

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Follow / Unfollow toggle
const { Notification } = require("../Services/notificationService");

router.put("/follow/:id", authmiddleware, async (req, res) => {
  try {
    const targetId = req.params.id;

    if (targetId === req.userId) {
      return res.status(400).json({ success: false, message: "Aap khud ko follow nahi kar sakte" });
    }

    const targetUser = await User.findById(targetId);
    const currentUser = await User.findById(req.userId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ success: false, message: "User nahi mila" });
    }

    const isFollowing = targetUser.followers.some((id) => id.toString() === req.userId);

    if (isFollowing) {
      targetUser.followers = targetUser.followers.filter((id) => id.toString() !== req.userId);
      currentUser.following = currentUser.following.filter((id) => id.toString() !== targetId);
    } else {
      targetUser.followers.push(req.userId);
      currentUser.following.push(targetId);
    }

    await targetUser.save();
    await currentUser.save();

    if (!isFollowing) {
      await createNotification({
        recipient: targetId,
        sender: req.userId,
        type: "follow",
      });
    }

    res.json({
      success: true,
      isFollowing: !isFollowing,
      followersCount: targetUser.followers.length,
      followingCount: currentUser.following.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});




module.exports = router;
