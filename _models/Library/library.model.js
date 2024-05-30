import mongoose from "mongoose";

const librarySchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		maxLength: 255,
	},
	location: {
		type: String,
		required: true,
	},
	contactNo: {
		type: String,
		required: true,
	},
	contactEmail: {
		type: String,
		required: true,
	},
	librarian: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "users",
	},
	totalBooks: {
		type: Number,
		required: true,
	},
  adminId : {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  }
});

const Library =
	mongoose.models["libraries"] || mongoose.model("libraries", librarySchema);

export default Library;
