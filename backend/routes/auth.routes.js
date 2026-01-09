import express from "express";
import { checkUsername, login, logout, signup } from "../controllers/auth.controller.js";
const router = express.Router();
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/check-username", checkUsername);
export default router;