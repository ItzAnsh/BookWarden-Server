import User from "../../_models/users/user.model.js";
import AsyncErrorHandler from "../../middlewares/AsyncErrorHandler.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Issue from "../../_models/Issue/issue.model.js";
import { findRole } from "../../lib/findRole.js";

const getUser = AsyncErrorHandler(async (req, res) => {
	const id = req.user;

	if (!id) {
		res.status(400).json({ message: "Invalid user" });
		return
	}
	const user = await User.findById(id);

	if (!user) {
		res.status(400).json({ message: "User not found" });
		return
	}
	res.json(user);
});

const loginUser = AsyncErrorHandler(async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		res.status(400).json({ message: "All fields are required" });
		return;
	}
	const user = await User.findOne({ email });
	if (!user) {
		res.status(400).json({ message: "User not found" });
		return;
	}
	if (!(await user.matchPassword(password))) {
		res.status(400).json({ message: "Invalid credentials" });
		return;
	}

	const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
		expiresIn: "7d",
	});
	// const role = findRole(user.role);
	// console.log(role);

	const role =
		user.role === process.env.ADMIN_KEY
			? "admin"
			: user.role === process.env.LIBRARIAN_KEY
			? "librarian"
			: "user";
	res.json({ token, role: role });
});

const updatePassword = AsyncErrorHandler(async (req, res) => {
	const id = req.user;
	const { oldPassword, newPassword } = req.body;

	if (!id || !oldPassword || !newPassword) {
		res.status(400).json({ message: "All fields are required" });
		return
	}

	const user = await User.findById({ _id: id });

	if (!user) {
		res.status(400).json({ message: "User not found" });
		return
	}

	if (!(await user.matchPassword(oldPassword))) {
		res.status(400).json({ message: "Invalid credentials" });
		return
	}

	user.password = newPassword;
	await user.save();
	res.json({ message: "Password updated successfully" });
});

const getUserIssues = AsyncErrorHandler(async (req, res) => {
	const id = req.user;

	const user = await User.findById(id);
	if (!user) {
		res.status(400).json({ message: "User not found" });
		return
	}

	const issuedBooks = await Issue.find({ userId: id }).populate("books");
	if (!issuedBooks) {
		res.status(400).json({ message: "Issue not found" });
		return
	}
	res.json(issuedBooks);
});

export { getUser, loginUser, updatePassword, getUserIssues };
