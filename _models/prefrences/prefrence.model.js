import mongoose from "mongoose";

const prefrenceSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "users",
        required : true
    },
    genres : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "genres"
        }
    ]
})

const Prefrence = mongoose.models["prefrences"] || mongoose.model("prefrences", prefrenceSchema);

export default Prefrence