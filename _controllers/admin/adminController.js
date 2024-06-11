import mongoose from "mongoose";
import Users from "../../_models/users/user.model.js";
import Library from "../../_models/Library/library.model.js";
import AsyncErrorHandler from "../../middlewares/AsyncErrorHandler.js";
import generateStrongPassword from "../../lib/generatePassword.js";
import User from "../../_models/users/user.model.js";
import {
	sendRequestStatusEmail,
	sendWelcomeEmail,
} from "../../lib/nodemailer.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import Request from "../../_models/requests/request.model.js";

dotenv.config();

const getAllUsers = AsyncErrorHandler(async (req, res) => {
	const users = await User.find();
	res.json(users);
});

const modifyUser = AsyncErrorHandler(async (req, res) => {
	const { userId, role } = req.body;

	if (!userId || !role) {
		res.status(404);
	}

	if (role !== "librarian" || role !== "user") {
		res.status(400);
	}

	const updateUser = await Users.findOneAndUpdate(
		{ _id: mongoose.Types.ObjectId(userId) },
		{ role: findRole(role) },
		{ new: true }
	);

	console.log(updateUser);
});

const getAllLibraries = AsyncErrorHandler(async (req, res) => {
	const libraries = await Library.find({ adminId: req.user }).populate({
		path: "librarian",
		select: "-password",
	});
	res.json(libraries);
});

const createLibrary = AsyncErrorHandler(async (req, res) => {
	const {
		name,
		location,
		contactNo,
		contactEmail,
		maxBooks,
		issuePeriod,
		librarianEmail,
		fineInterest,
	} = req.body;

	if (
		!name ||
		!location ||
		!contactNo ||
		!contactEmail ||
		!maxBooks ||
		!issuePeriod ||
		!librarianEmail ||
		!fineInterest
	) {
		res.status(404).json({
			message: "All fields are required",
		});
		return;
	}
	let librarian = await Users.findOne({
		email: librarianEmail,
		role: process.env.LIBRARIAN_KEY,
	});
	if (!librarian) {
		const password = generateStrongPassword();
		librarian = new Users({
			email: librarianEmail,
			password: password,
			role: process.env.LIBRARIAN_KEY,
			adminId: req.user,
		});
		sendWelcomeEmail(librarianEmail, password, "Librarian");
		await librarian.save();
	}

	const newLibrary = new Library({
		name,
		location,
		contactNo,
		contactEmail,
		librarian: librarian._id,
		totalBooks: 0,
		adminId: req.user,
		issuePeriod,
		maxBooks,
		fineInterest,
	});
	await newLibrary.save();
	res.json(newLibrary);
});

const updateLibrary = AsyncErrorHandler(async (req, res) => {
	const { id: libraryId } = req.params;

	if (!libraryId) {
		res.status(400).json({ message: "All fields are required" });
		return;
	}

	const library = await Library.findById(libraryId);

	if (!library) {
		res.status(404).json({ message: "Library not found" });
		return;
	}

	if (library.adminId.toString() !== req.user.toString()) {
		res
			.status(400)
			.json({ message: "You are not authorized to perform this action" });
		return;
	}

	let {
		name,
		location,
		contactNo,
		contactEmail,
		maxBooks,
		issuePeriod,
		librarianEmail,
		fineInterest,
	} = req.body;

	let librarianId = library.librarian;
	if (librarianEmail) {
		let librarian = await Users.findOne({ email: librarianEmail });
		if (!librarian) {
			const password = generateStrongPassword();
			librarian = new Users({
				email: librarianEmail,
				password: password,
				role: process.env.LIBRARIAN_KEY,
				adminId: req.user,
			});
			sendWelcomeEmail(librarianEmail, password, "Librarian");
			librarianId = librarian._id;
			await librarian.save();
		}
	}

	name = name || library.name;
	location = location || library.location;
	contactNo = contactNo || library.contactNo;
	contactEmail = contactEmail || library.contactEmail;
	maxBooks = maxBooks || library.maxBooks;
	issuePeriod = issuePeriod || library.issuePeriod;
	fineInterest = fineInterest || library.fineInterest;

	const updateLibrary = await Library.findByIdAndUpdate(
		libraryId,

		{
			name,
			location,
			contactNo,
			contactEmail,
			issuePeriod,
			maxBooks,
			fineInterest,
			librarian: librarianId,
		},
		{ new: true }
	);

	if (!updateLibrary) {
		res.status(400).json({ message: "Library not Updated" });
		return;
	}
	res.json(updateLibrary);
});

const deleteLibrary = AsyncErrorHandler(async (req, res) => {
	const { id: libraryId } = req.params;

	if (!libraryId) {
		res.status(404).json({ message: "All fields are required" });
		return;
	}
	//   console.log("sel");

	const library = await Library.findById(libraryId);
	if (!library) {
		res.status(404).json({ message: "Library not found" });
		return;
	}

	if (library.adminId.toString() !== req.user.toString()) {
		res
			.status(400)
			.json({ message: "You are not authorized to perform this action" });
		return;
	}

	const deletedLibrary = await Library.findByIdAndDelete(libraryId);

	res.json(deletedLibrary);
});

const createLibrarian = AsyncErrorHandler(async (req, res) => {
	const { name, email } = req.body;

	if (!name || !email) {
		res.status(404).json({
			message: "All fields are required",
		});
		return;
	}
	const existingUser = await Users.findOne({ email });
	if (existingUser) {
		res.status(400).json({ message: "Librarian already exists" });
		return;
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
		res.status(404).json({ message: "Invalid input data" });
		return;
	}
	const createdLibrarians = [];
	const emailContent = [];
	for (const librarian of librarians) {
		const password = generateStrongPassword();
		emailContent.push({
			email: librarian.email,
			password,
			name: librarian.name,
		});
		createdLibrarians.push({
			name: librarian.name,
			email: librarian.email,
			password,
			role: process.env.LIBRARIAN_KEY,
			adminId: req.user,
		});
	}
	for (const email of emailContent) {
		sendWelcomeEmail(email.email, email.password, email.name);
	}
	await Users.insertMany(createdLibrarians);

	res.json({ createdLibrarians });
});

const registerAdmin = AsyncErrorHandler(async (req, res) => {
	const { name, email, password } = req.body;
	if (!name || !email || !password) {
		res.status(404).json({
			message: "All fields are required",
		});
		return;
	}

	if (await Users.findOne({ email })) {
		res.status(400).json({
			message: "Admin already exists",
		});
		return;
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
		return;
	}
	const user = await Users.findOne({ email });
	if (!user) {
		res.status(404).json({ message: "User not found" });
		return;
	}
	if (user.role !== process.env.ADMIN_KEY) {
		res.status(400).json({ message: "Not an admin" });
		return;
	}

	if (!(await user.matchPassword(password))) {
		res.status(400).json({ message: "Invalid credentials" });
		return;
	}

	const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
		expiresIn: "7d",
	});
	console.log(token);
	res.json({ token, message: "Admin logged in successfully" });
	return;
});

const getAllRequests = AsyncErrorHandler(async (req, res) => {
	const requests = await Request.find({ adminId: req.user })
		.populate("bookId")
		.populate("libraryId")
		.populate("librarianId");
	res.json(requests);
});

const approveRequest = AsyncErrorHandler(async (req, res) => {
	const { requestId } = req.body;
	if (!requestId) {
		res.status(400).json({ message: "Invalid input data" });
		return;
	}

	const request = await Request.findById(requestId)
		.populate("librarianId")
		.populate("bookId")
		.populate("libraryId");
	if (!request) {
		res.status(404).json({ message: "Request not found" });
		return;
	}

	if (request.status === "Approved" || request.status === "Completed") {
		res
			.status(400)
			.json({ message: "Request has already been approved or completed" });
		return;
	}
	if (request.status === "Rejected") {
		res.status(400).json({ message: "Request has already been rejected" });
		return;
	}
	if (request.adminId.toString() !== req.user.toString()) {
		res
			.status(401)
			.json({ message: "You are not authorized to perform this action" });
		return;
	}

	request.status = "Approved";
	await request.save();
	sendRequestStatusEmail(request.librarianId.email, request);
	res.json({ message: "Request approved successfully" });
});

const rejectRequest = AsyncErrorHandler(async (req, res) => {
	const { requestId } = req.body;
	if (!requestId) {
		res.status(400).json({ message: "Invalid input data" });
		return;
	}

	const request = await Request.findById(requestId)
		.populate("librarianId")
		.populate("bookId")
		.populate("libraryId");
	if (!request) {
		res.status(404).json({ message: "Request not found" });
		return;
	}

	if (request.status === "Approved" || request.status === "Completed") {
		res
			.status(400)
			.json({ message: "Request has already been approved or completed" });
		return;
	}
	if (request.status === "Rejected") {
		res.status(400).json({ message: "Request has already been rejected" });
		return;
	}
	if (request.adminId.toString() !== req.user.toString()) {
		res
			.status(401)
			.json({ message: "You are not authorized to perform this action" });
		return;
	}

	request.status = "Rejected";
	await request.save();
	sendRequestStatusEmail(request.librarianId.email, request)
		.populate("librarianId")
		.populate("bookId")
		.populate("libraryId");
	res.json({ message: "Request rejected successfully" });
});

const cancelRequest = AsyncErrorHandler(async (req, res) => {
	const { requestId } = req.body;
	if (!requestId) {
		res.status(400).json({ message: "Invalid input data" });
		return;
	}

	const request = await Request.findById(requestId)
		.populate("librarianId")
		.populate("bookId")
		.populate("libraryId");
	if (!request) {
		res.status(404).json({ message: "Request not found" });
		return;
	}

	if (request.status === "Completed") {
		res
			.status(400)
			.json({ message: "Request has already been marked as completed" });
		return;
	}
	if (request.status === "Rejected") {
		res.status(400).json({ message: "Request has already been rejected" });
		return;
	}
	if (request.adminId.toString() !== req.user.toString()) {
		res
			.status(401)
			.json({ message: "You are not authorized to perform this action" });
		return;
	}

	request.status = "Cancelled";
	await request.save();
	sendRequestStatusEmail(request.librarianId.email, request);
	res.json({ message: "Request cancelled successfully" });
});

const markRequestAsCompleted = AsyncErrorHandler(async (req, res) => {
	const { requestId } = req.body;
	if (!requestId) {
		res.status(400).json({ message: "Invalid input data" });
		return;
	}

	const request = await Request.findById(requestId)
		.populate("librarianId")
		.populate("bookId")
		.populate("libraryId");
	if (!request) {
		res.status(404).json({ message: "Request not found" });
		return;
	}

	if (request.status === "Completed") {
		res
			.status(400)
			.json({ message: "Request has already been marked as completed" });
		return;
	}
	if (request.status === "Rejected") {
		res.status(400).json({ message: "Request has already been rejected" });
		return;
	}
	if (request.adminId.toString() !== req.user.toString()) {
		res
			.status(401)
			.json({ message: "You are not authorized to perform this action" });
		return;
	}

	request.status = "Completed";
	await request.save();
	sendRequestStatusEmail(request.librarianId.email, request);
	res.json({ message: "Request marked as completed successfully" });
});

export {
	modifyUser,
	getAllUsers,
	getAllLibraries,
	createLibrary,
	deleteLibrary,
	updateLibrary,
	createLibrarian,
	createMultipleLibrarians,
	registerAdmin,
	loginAdmin,
	getAllRequests,
	approveRequest,
	rejectRequest,
	cancelRequest,
	markRequestAsCompleted,
};
