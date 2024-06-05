import mongoose from "mongoose";

const issueSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "books",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  libraryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "libraries",
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
    enum: ["rejected", "requested", "issued", "returned", "fined", "fining", "fining-returned", "renew-requested", "renew-rejected", "renew-approved"],
    default: "requested",
    required: true,
  },
  returnDate: {
    type: Date,
  },
});

const Issue =
  mongoose.models["issues"] || mongoose.model("issues", issueSchema);

export default Issue;
