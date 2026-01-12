// import express from "express";
// import dotenv from "dotenv";
// import cookieParser from "cookie-parser";
// import path from "path";
// import cors from "cors";
// import helmet from "helmet";
// import authRoutes from "./routes/auth.routes.js";
// import messageRoutes from "./routes/message.routes.js";
// import userRoutes from "./routes/user.routes.js";

// // import connectToMongoDB from "./db/connectToMongoDB.js";
// import { app, server } from "./socket/socket.js";

// // import rateLimit from 'express-rate-limit';
// // const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }); // 100 req per 15 min
// // app.use("/api", limiter);

// app.use(helmet());
 
// app.use(cors());
// dotenv.config();
// const PORT = process.env.PORT || 8000;
// const __dirname = path.resolve();

// app.use(express.json());
// app.use(cookieParser());

// app.use("/api/auth", authRoutes);
// app.use("/api/messages", messageRoutes);
// app.use("/api/users", userRoutes);

// // DB Connection helper (create file db/connectToMongoDB.js simply containing mongoose.connect logic)
// import mongoose from "mongoose";
// const connectDB = async () => {
//     try { await mongoose.connect(process.env.MONGO_DB_URI); console.log("Connected to MongoDB"); }
//     catch (error) { console.log("Error connecting to MongoDB", error.message); }
// }

// server.listen(PORT, () => {
//     connectDB();
//     console.log(`Server Running on port ${PORT}`);
// });



import "dotenv/config"; // LOAD ENV VARS FIRST
import express from "express";
// import dotenv from "dotenv"; // No longer needed as separate import/config call
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";

// import connectToMongoDB from "./db/connectToMongoDB.js";
import { app, server } from "./socket/socket.js";

// import rateLimit from 'express-rate-limit';
// const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }); // 100 req per 15 min
// app.use("/api", limiter);

app.use(helmet());
 
app.use(cors());
// dotenv.config(); // REMOVED (Moved to top import)

const PORT = process.env.PORT || 8000;
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// DB Connection helper
import mongoose from "mongoose";
const connectDB = async () => {
    try { await mongoose.connect(process.env.MONGO_DB_URI); console.log("Connected to MongoDB"); }
    catch (error) { console.log("Error connecting to MongoDB", error.message); }
}

server.listen(PORT, () => {
    connectDB();
    console.log(`Server Running on port ${PORT}`);
});