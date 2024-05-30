import mongoose from "mongoose";

const issueSchema = new mongoose.Schema({
	books : [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "books",
			required: true,
		},
	],
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "users",
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
		enum: ["rejected", "requested", "issued", "returned", "fined", "fining"],
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
