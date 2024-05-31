import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		maxLength: 255,
	},
	email: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	date: {
		type: Date,
		default: Date.now,
	},
	role: {
		type: String,
		default: "",
		enum: [process.env.ADMIN_KEY, process.env.LIBRARIAN_KEY, ""],
	},
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    }
});

userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models["users"] || mongoose.model("users", userSchema);

export default User;
