import mongoose from "mongoose";

const genreSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
});

const Genre =
	mongoose.models["genres"] || mongoose.model("genres", genreSchema);

export default Genre;
