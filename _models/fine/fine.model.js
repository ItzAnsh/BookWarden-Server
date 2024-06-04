import mongoose from "mongoose"

const fineSchema = new mongoose.Schema[{
    issueId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
    ,
    amount: {
        type: Number,
        required: true
    }
    , 
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Completed', 'Revoked'],
        default: 'Pending',
        required: true
    },
    fCategory: {
        type: String,
        enum: ['Lost or damaged', 'Due date exceeded'],
        required: true
    },
    interest: {
        type: Number,
        default: 0
    },
    transactionId: {
        type: String,
        required: true
    }
}]

const Fine = mongoose.model("fine",fineSchema);

export default Fine;