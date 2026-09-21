const Notification = require("../models/Notification_Schema");
const { getIO, getReceiverSocketId} = require("../socket");

const createnotification = async ({ recipient, sender, type, post, text}) =>{
    try {
        if(String(recipient) === String(sender))
            return null;

        const notification = await Notification.create({  recipient, sender, type, post, text });
        const populate = await notification.populate("sender", "username name avatar");

        const socketId = getReceiverSocketId(recipient);
        if (socketId) {
            getIO().to(socketId).emit("newNotification", populate);
        }
        return populate;
        
    } catch (error) {
            console.error("Notification create error:", error);

    }
};
module.exports = { createnotification };