import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxLength: 255
    }, 
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    role: {
        type: String,
        default: "",
        enum: [process.env.ADMIN_KEY, process.env.LIBRAARIAN_KEY, ""]
    }
})

const User = mongoose.model("users", userSchema);

export default User;