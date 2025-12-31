import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }]

}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);
export default Message;