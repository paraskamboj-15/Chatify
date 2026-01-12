import express from "express";
import { getMessages, sendMessage, deleteMessage } from "../controllers/message.controller.js"; // Added deleteMessage import
import protectRoute from "../middleware/protectRoute.js";
import multer from "multer";

const router = express.Router();

// Configure Multer (store in memory so Cloudinary can upload it directly)
const storage = multer.diskStorage({}); // Use diskStorage if sending path to cloudinary, or memoryStorage for buffer
const upload = multer({ storage });

router.get("/:id", protectRoute, getMessages);

// Added 'upload.single("file")' middleware
router.post("/send/:id", protectRoute, upload.single("file"), sendMessage);

// Added missing delete route referenced in frontend
router.delete("/delete/:messageId", protectRoute, deleteMessage);

export default router;