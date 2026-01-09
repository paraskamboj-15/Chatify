import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js"

export const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;
        let fileUrl = "";
        let fileType = "text";

        // Handle File Upload (assuming req.file exists via Multer)
        if (req.file) {
            const uploadResponse = await cloudinary.uploader.upload(req.file.path);
            fileUrl = uploadResponse.secure_url;
            fileType = req.file.mimetype.startsWith("image/") ? "image" : "file";
        }

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!conversation) {
            conversation = await Conversation.create({ participants: [senderId, receiverId] });
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            message: message || "", // Allow empty text if file exists
            fileUrl,
            fileType
        });

        if (newMessage) {
            conversation.messages.push(newMessage._id);
        }

        await Promise.all([conversation.save(), newMessage.save()]);

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const senderId = req.user._id;
        
        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId] },
        }).populate({
            path: "messages",
            match: { deletedBy: { $ne: senderId } } // FILTER: Don't show messages deleted by me
        });

        if (!conversation) return res.status(200).json([]);
        res.status(200).json(conversation.messages);
    } catch (error) { res.status(500).json({ error: "Internal server error" }); }
};

export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { type } = req.body; // 'me' or 'everyone'
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ error: "Message not found" });

        if (type === 'everyone') {
            // Ensure only sender can delete for everyone
            if (message.senderId.toString() !== userId.toString()) {
                return res.status(403).json({ error: "You can only delete your own messages for everyone" });
            }
            await Message.findByIdAndDelete(messageId);
            
            // Notify receiver via Socket
            const receiverSocketId = getReceiverSocketId(message.receiverId);
            if (receiverSocketId) io.to(receiverSocketId).emit("messageDeleted", messageId);
        } else {
            // Delete for me (Soft delete)
            if (!message.deletedBy.includes(userId)) {
                message.deletedBy.push(userId);
                await message.save();
            }
        }
        res.status(200).json({ messageId, type });
    } catch (error) { res.status(500).json({ error: "Internal server error" }); }
};

export const deleteConversation = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const userId = req.user._id;

        const conversation = await Conversation.findOne({
            participants: { $all: [userId, userToChatId] }
        });

        if (conversation) {
            // Logic: Realistically, you'd soft delete the conversation reference for the user.
            // For simplicity here, we will just clear messages for the user (add user to deletedBy in all messages)
            await Message.updateMany(
                { _id: { $in: conversation.messages } },
                { $addToSet: { deletedBy: userId } }
            );
        }
        res.status(200).json({ message: "Conversation deleted" });
    } catch (error) { res.status(500).json({ error: "Internal server error" }); }
};

export const markAsRead = async (req, res) => {
    try {
        const { senderId } = req.body; // The person who sent the messages I am reading
        const readerId = req.user._id;

        await Message.updateMany(
            { senderId: senderId, receiverId: readerId, readAt: null },
            { $set: { readAt: new Date() } }
        );
        
        // Notify the sender that I read their messages
        const senderSocketId = getReceiverSocketId(senderId);
        if (senderSocketId) {
            io.to(senderSocketId).emit("messagesRead", { by: readerId });
        }
        res.status(200).json({ success: true });
    } catch (error) { res.status(500).json({ error: "Internal Server Error" }); }
};