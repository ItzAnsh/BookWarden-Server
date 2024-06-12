import { text } from "express";
import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
	bookId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "books", // Assuming you have a Book model
		required: true,
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "users", // Assuming you have a User model
		required: true,
	},
	rating: {
		type: Number,
		min: 1,
		max: 5,
		required: true,
	},
	text: {
		type: String
	}
});

const Rating =
	mongoose.models["ratings"] || mongoose.model("ratings", ratingSchema);

export default Rating;
