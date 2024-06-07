import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
    bookId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "books",
        required : true
    },
    quantity : {
        type : Number,
        required : true
    },
    librarianId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "users",
        required : true
    },
    adminId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "users",
        required : true
    },
    libraryId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "libraries",
        required : true
    },
    dateReuested : {
        type : Date,
        default : Date.now,
        required : true
    },
    dateAcknowledged : {
        type : Date
    },
    dateCompleted : {
        type : Date
    },
    status : {
        type : String,
        enum : ["Requested", "Approved", "Rejected", "Completed", "Cancelled"],
        default : "Requested",
        required : true
    }
})

const Request = mongoose.model("requests", requestSchema);

export default Request