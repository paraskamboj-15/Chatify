// import mongoose from "mongoose";

// const messageSchema = new mongoose.Schema({
//     senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     message: { type: String, required: true },
//     deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }]

// }, { timestamps: true });

// const Message = mongoose.model("Message", messageSchema);
// export default Message;


import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String }, // Can be empty if sending just an image
    fileUrl: { type: String, default: "" }, // URL for image/video/file
    fileType: { type: String, enum: ["text", "image", "video", "file"], default: "text" },
    readAt: { type: Date, default: null }, // Timestamp for "Blue Ticks"
    deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }]
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);
export default Message;