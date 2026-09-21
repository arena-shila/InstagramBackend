const express = require("express");
const router = express.Router();
const authmiddleware = require("../Middleware/authmiddleware");
const Notification = require("../models/Notification_Schema");


router.get("/", authmiddleware, async (req, res) => {
    try {
        const notification = await Notification.find({ recipient: req.userId})
        .populate("sender", "username name avatar")
        .populate("post", "media image")
        .sort({ createdAt: -1 })
        .limit(50);

        const unreadCount = await Notification.countDocumennt({
            recipient: req.userId,
            isRead: false,
        });

        res.json({ success: true, notification, unreadCount});
        
    } catch (error) {
            res.status(500).json({ success: false, message: error.message });

    }
    
});


// notification mark when read
router.put("/.id/read", authmiddleware, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            {_id: req.params.id, recipient: req.userId},
            { isRead: true},
            { new: true }
        );

        res.json({success: true, notification});
    } catch (error) {
     
            res.status(500).json({ success: false, message: error.message });

    }
    
});

router.put("/read-all", authmiddleware, async (req, res) =>{
    try {
        await Notification.updateMany(
      { recipient: req.userId, isRead: false },
      { isRead: true }
    );
        
    } catch ( error  ) {
            res.status(500).json({ success: false, message: error.message });

    }
});
module.exports =  router;