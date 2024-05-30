import mongoose from "mongoose";
import Users from "../../_models/users/user.model.js";
import Library from "../../_models/Library/library.model.js";
import AsyncErrorHandler from "../../middlewares/AsyncErrorHandler.js";
import generateStrongPassword from "../../lib/generatePassword.js";
import User from "../../_models/users/user.model.js";
import { sendWelcomeEmail } from "../../lib/nodemailer.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

dotenv.config();

const getAllUsers = AsyncErrorHandler(async (req, res) => {
	const users = await User.find();
	res.json(users);
});

const getSpecificUser = AsyncErrorHandler(async (req, res) => {
	const { userId } = req.params;
	if (!userId) {
		res.status(400);
	}

	const user = await User.findById({ _id: mongoose.Types.ObjectId(userId) });
	res.json(user);
});

const modifyUser = AsyncErrorHandler(async (req, res) => {
	const { userId, role } = req.body;

	if (!userId || !role) {
		res.status(400);
	}

	if (role !== "librarian" || role !== "user") {
		res.status(400);
	}

	const updateUser = await Users.findOneAndUpdate(
		{ _id: mongoose.Types.ObjectId(userId) },
		{ role: findRole(role) }
	);

	console.log(updateUser);
});

const createLibrary = AsyncErrorHandler(async (req, res) => {
	const { name, location, contactNo, contactEmail } = req.body;

	if (!name || !location || !contactNo || !contactEmail) {
		res.status(400).json({
			message: "All fields are required",
		});
	}

	const newLibrary = new Library({
		name,
		location,
		contactNo,
		contactEmail,
		totalBooks: 0,
		adminId: req.user,
	});
	await newLibrary.save();
	res.json(newLibrary);
});

const createLibrarian = AsyncErrorHandler(async (req, res) => {
	const { name, email } = req.body;

	if (!name || !email) {
		res.status(400).json({
			message: "All fields are required",
		});
	}
	const existingUser = await Users.findOne({ email });
	if (existingUser) {
		res.status(400).json({ message: "Librarian already exists" });
	}
	const password = generateStrongPassword();

	const newLibrarian = new Users({
		name,
		email,
		password,
		role: process.env.LIBRARIAN_KEY,
		adminId: req.user,
	});
	await newLibrarian.save();
	sendWelcomeEmail(email, password, name);
	res.json({ newLibrarian, password });
});

const createMultipleLibrarians = AsyncErrorHandler(async (req, res) => {
	const { librarians } = req.body;
	if (!librarians || !Array.isArray(librarians)) {
		return res.status(400).json({ message: "Invalid input data" });
	}
	const createdLibrarians = await Promise.all(
		librarians.map(async ({ name, email }) => {
			if (!name || !email) {
				return; // Skip invalid entries
			}
			const password = generateStrongPassword();
			const newLibrarian = new User({
				name,
				email,
				password,
				role: process.env.LIBRARIAN_KEY,
			});
			await newLibrarian.save();
			sendWelcomeEmail(email, password, name);
			return { name, email, password };
		})
	).filter(Boolean);
	res.json({ createdLibrarians });
});

const registerAdmin = AsyncErrorHandler(async (req, res) => {
	const { name, email, password } = req.body;
	if (!name || !email || !password) {
		res.status(400).json({
			message: "All fields are required",
		});
	}

	if (await Users.findOne({ email })) {
		res.status(400).json({
			message: "Admin already exists",
		});
	}

	const admin = await Users.create({
		name,
		email,
		password,
		role: process.env.ADMIN_KEY,
	});

	const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
		expiresIn: "7d",
	});

	res.json({ token, message: "Admin created successfully" });
});

const loginAdmin = AsyncErrorHandler(async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		res.status(400).json({ message: "All fields are required" });
	}
	const user = await Users.findOne({ email });
	if (!user) {
		res.status(404).json({ message: "User not found" });
	}
	if (user.role !== process.env.ADMIN_KEY) {
		res.status(400).json({ message: "Not an admin" });
	}

	if (!(await user.matchPassword(password))) {
		res.status(400).json({ message: "Invalid credentials" });
	}

	const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
		expiresIn: "7d",
	});
	console.log(token);
	res.json({ token, message: "Admin logged in successfully" });
});

export {
	modifyUser,
	getAllUsers,
	getSpecificUser,
	createLibrary,
	createLibrarian,
	createMultipleLibrarians,
	registerAdmin,
	loginAdmin,
};
