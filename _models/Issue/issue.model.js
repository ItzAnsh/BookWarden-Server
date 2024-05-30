import mongoose from "mongoose";

const issueSchema = new mongoose.Schema({
	bookId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Book",
		required: true,
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	date: {
		type: Date,
		default: Date.now,
		required: true,
	},
	deadline: {
		type: Date,
		required: true,
	},
	status: {
		type: String,
		enum: ["requested", "issued", "returned", "fined", "fining"],
		default: "requested",
		required: true,
	},
	returnDate: {
		type: Date,
	},
	lastRenewedAt: {
		type: Date,
	},
});

const Issue = mongoose.models["issues"] || mongoose.model("Issue", issueSchema);

export default Issue;
