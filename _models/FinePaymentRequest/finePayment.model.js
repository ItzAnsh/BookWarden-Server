import mongoose from "mongoose";

const finePaymentRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    },
    fineAmount: Number,
    status: String
});

const FinePaymentRequest = mongoose.model('FinePaymentRequest', finePaymentRequestSchema);
export default FinePaymentRequest;
