import mongoose from "mongoose";
import Users from "../../_models/users/user.model.js";
import AsyncErrorHandler from "../../middlewares/AsyncErrorHandler.js";
import generateStrongPassword from "../../lib/generatePassword.js";
import sendWelcomeEmail from "../../lib/nodemailer.js";
import dotenv from "dotenv";


dotenv.config();

const getAllUsers = AsyncErrorHandler(async (req, res) => {});

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
	});
	await newLibrary.save();
	res.json(newLibrary);
})

const createLibrarian = AsyncErrorHandler(async (req, res) => {
	const { name, email } = req.body;

	if (!name || !email) {
		res.status(400).json({
			message: "All fields are required",
		});
	}

	const password = generateStrongPassword();

	const newLibrarian = new Users({
		name,
		email,
		password,
		role: process.env.LIBRARIAN_KEY,
	});
	await newLibrarian.save();
	await sendWelcomeEmail(email, password, name);
	res.json({newLibrarian, password});
})


export { modifyUser, getAllUsers, createLibrary, createLibrarian };
