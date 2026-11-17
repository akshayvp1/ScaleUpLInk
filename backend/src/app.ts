import "./config/env";
import "reflect-metadata";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import http from "http";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import fullRouter from "./routes/router";
import payment from "./routes/paymentRouter";
import { corsOptions } from "./config/cors";
import "./config/container";
import {
    connectToDatabase,
    disconnectFromDatabase,
} from "./config/database";
import { startSeatHoldCleanupJob } from "./jobs/releaseExpiredSeatHolds";
import { initializeSocket } from "./socket/socket";
import { seedOnboardingCatalogs } from "./utils/onboardingCatalog";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: corsOptions,
    maxHttpBufferSize: 12 * 1024 * 1024,
    pingTimeout: 60000,
    pingInterval: 25000,
});

app.set("io", io);

const PORT = process.env.PORT || 4040;

// Middlewares
app.use(cors(corsOptions));

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

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "ScaleUp Link Backend is running!",
  });
});

// Start server only after MongoDB is reachable so background jobs and socket
// handlers never issue queries against an unconnected/incorrect database.
const startServer = async () => {
    try {
        await connectToDatabase();
        await seedOnboardingCatalogs();

        initializeSocket(io);
        startSeatHoldCleanupJob();

        server.listen(PORT, () => {
            console.log(`[server] Listening on http://localhost:${PORT}`);
            console.log("[server] Socket.IO ready");
        });

        server.on("error", (error: NodeJS.ErrnoException) => {
            if (error.code === "EADDRINUSE") {
                console.error(
                    `[server] Port ${PORT} is already in use. Stop the other process or set a different PORT.`
                );
            } else {
                console.error("[server] HTTP server error:", error.message);
            }
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Unknown startup error";
        console.error("[startup] Failed to start server:", message);
        process.exit(1);
    }
};

let shuttingDown = false;

const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log(`[server] ${signal} received, shutting down...`);

    const forceExit = setTimeout(() => {
        console.error("[server] Forced shutdown after timeout.");
        process.exit(1);
    }, 10000);
    forceExit.unref();

    server.close(async () => {
        try {
            await disconnectFromDatabase();
        } catch (error) {
            console.error(
                "[mongo] Error while disconnecting:",
                error instanceof Error ? error.message : error
            );
        } finally {
            clearTimeout(forceExit);
            process.exit(0);
        }
    });
};

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

void startServer();
