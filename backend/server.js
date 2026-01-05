import express from 'express'
import "dotenv/config"
import mongoose from 'mongoose'
import cors from 'cors'
import { OpenRouter } from '@openrouter/sdk';
import githubTestRoutes from './Routers/GithubTesting.js' // Path fixed relative to this file
import chatRoutes from "./Routers/chat.js"
import loadRoute from "./Routers/Load.js"
import authRoutes from "./Routers/auth.js"
import razorpayRoutes from "./Routers/razorpay.js"
import { verifyToken, checkCreditsOrSub } from "./Middleware/authMiddleware.js"
import "./cron.js"; // Start Cron Jobs


const app = express();
const port = process.env.PORT || 8080;

// Configure CORS for production and development
const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8080",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080"
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Log every origin to see what Render is actually receiving
        console.log(`📡 Incoming request from origin: ${origin || "No Origin"}`);
        callback(null, true); // Allow everything for now to unblock
    },
    credentials: true
}));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Public Routes
app.use("/api/auth", authRoutes);

// ---------------------------------------------------------
// GLOBAL SECURITY CACHE
// ---------------------------------------------------------
const apiRouter = express.Router();
apiRouter.use(verifyToken);

// 1. Payment
apiRouter.use("/payment", razorpayRoutes);

// 2. Load Testing
apiRouter.use("/load-test", loadRoute);

// 3. Chat
apiRouter.use("/chat", chatRoutes);

// 4. Github Analysis
apiRouter.use("/github-test", githubTestRoutes);

// Mount everything on /api
app.use("/api", apiRouter);


// Health Check
app.get("/health", (req, res) => res.json({ status: "ok" }));

const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("connected to db");

        app.listen(port, "0.0.0.0", () => {
            console.log(`Server is running at http://localhost:${port}`);
        });
    } catch (e) {
        console.log(`failed to connect to db due to error: ${e}`);
        process.exit(1);
    }
};

startServer();

// const openRouter = new OpenRouter({
//   apiKey:process.env.OpenRouter,
//   defaultHeaders: {
//   },
// });

// const completion = await openRouter.chat.send({
//   model: 'xiaomi/mimo-v2-flash:free',
//   messages: [
//     {
//       role: 'user',
//       content: 'x+y = 7',
//             content: 'values only',
//     },
//   ],
//   stream: false,
// });

// console.log(completion.choices[0].message.content);

