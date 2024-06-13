import mongoose from "mongoose"

const transactionSchema = new mongoose.Schema({
    fineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref : "fines",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const Transaction = mongoose.model("transactions",transactionSchema);

export default Transaction;