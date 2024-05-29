// Dependencies
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./middlewares/connectDB.js";

// Import Routes
import userRouter from "./_routes/users/users.routes.js";
import adminRouter from "./_routes/admin/admin.routes.js";
dotenv.config();

// Initialize Express
const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/users", userRouter);
app.use("/api/admin", adminRouter);

// Start Server
app.listen(3000, connectDB(), async () => {
	console.log("Server is running on port 3000");
});
