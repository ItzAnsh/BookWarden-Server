import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./middlewares/connectDB.js";
dotenv.config();

const app = express();

app.use(express.json());

// app.use(cors());

// Connect to MongoDB

app.listen(3002, connectDB(), async () => {
	console.log("Server is running on port 3002");
});
