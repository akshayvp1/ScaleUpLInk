import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import morgan from "morgan";
import http from "http";
import { Server } from "socket.io";
import fullRouter from "./routes/router";
import payment from "./routes/paymentRouter";
import "./config/container";
import { startSeatHoldCleanupJob } from "./jobs/releaseExpiredSeatHolds";
import { initializeSocket } from "./socket/socket";

import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    },
    maxHttpBufferSize: 10 * 1024 * 1024,
});

app.set("io", io);
initializeSocket(io);

const PORT = process.env.PORT || 4040;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("MongoDB URI is not set in environment variables.");
    process.exit(1);
}

// MongoDB Events
mongoose.connection.on("connected", () => {
    console.log("✅ MongoDB connection established");
});

mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
    console.log("⚠️ MongoDB disconnected");
});

startSeatHoldCleanupJob()

// Middlewares
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    })
);

app.use(morgan("dev"));

// Stripe webhook (must come before express.json())
app.use(
    "/payments/webhook",
    express.raw({
        type: "application/json",
    })
);

// JSON Parser
app.use(
    express.json({
        limit: "50mb",
    })
);

app.use(
    express.urlencoded({
        limit: "50mb",
        extended: true,
    })
);

app.use(cookieParser());

// Routes
app.use("/api", fullRouter);
app.use("/payments", payment);


// Start Server
const startServer = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 15000,
        });

        console.log("✅ MongoDB Connected Successfully");

        server.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`🔌 Socket.IO running`);
        });

    } catch (err: any) {
        console.error("❌ MongoDB Connection Error:", err.message);
        process.exit(1);
    }
};

startServer();