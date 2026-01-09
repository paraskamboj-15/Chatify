import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";

export const signup = async (req, res) => {
    try {
        const { fullName, username, password, confirmPassword, gender } = req.body;
        if (password !== confirmPassword) return res.status(400).json({ error: "Passwords don't match" });

        const user = await User.findOne({ username });
        if (user) return res.status(400).json({ error: "Username already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
        const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

        const newUser = new User({
            fullName, username, password: hashedPassword, gender,
            profilePic: gender === "male" ? boyProfilePic : girlProfilePic
        });

        if (newUser) {
            const token = generateTokenAndSetCookie(newUser._id, res);
            await newUser.save();
            res.status(201).json({
                _id: newUser._id, fullName: newUser.fullName, username: newUser.username, profilePic: newUser.profilePic,
                token
            });
        } else {
            res.status(400).json({ error: "Invalid user data" });
        }
    } catch (error) { res.status(500).json({ error: "Internal Server Error" }); }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

        if (!user || !isPasswordCorrect) return res.status(400).json({ error: "Invalid credentials" });

        const token = generateTokenAndSetCookie(user._id, res);
        res.status(200).json({
            _id: user._id, fullName: user.fullName, username: user.username, profilePic: user.profilePic,
            token
        });
    } catch (error) { res.status(500).json({ error: "Internal Server Error" }); }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) { res.status(500).json({ error: "Internal Server Error" }); }
};

export const checkUsername = async (req, res) => {
    try {
        const { username } = req.body;
        const user = await User.findOne({ username });
        if (user) {
            // Suggest 3 alternatives
            const suggestions = [
                `${username}${Math.floor(Math.random() * 100)}`,
                `${username}_${Math.floor(Math.random() * 100)}`,
                `${username}official`
            ];
            return res.status(200).json({ available: false, suggestions });
        }
        res.status(200).json({ available: true });
    } catch (error) { res.status(500).json({ error: "Internal Server Error" }); }
};

export const updateProfile = async (req, res) => {
    try {
        const { fullName, password, gender } = req.body;
        const userId = req.user._id;
        
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({ error: "User not found" });

        if(fullName) user.fullName = fullName;
        if(gender) user.gender = gender;
        if(password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();
        res.status(200).json({ 
            _id: user._id, fullName: user.fullName, username: user.username, profilePic: user.profilePic 
        });
    } catch (error) { res.status(500).json({ error: "Internal Server Error" }); }
};