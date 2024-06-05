import mongoose from "mongoose";

const fineSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  issueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "issues",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Completed", "Revoked"],
    default: "Pending",
    required: true,
  },
  category: {
    type: String,
    enum: ["Lost or damaged", "Due date exceeded"],
    required: true,
  },
  interest: {
    type: Number,
    default: 0,
  },
  transactionId: {
    type: String,
  },
});

const Fine = mongoose.models["fines"] || mongoose.model("fines", fineSchema);

export default Fine;
