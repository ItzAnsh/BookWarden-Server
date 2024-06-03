import Library from "../../_models/Library/library.model.js";
import User from "../../_models/users/user.model.js";
import AsyncErrorHandler from "../../middlewares/AsyncErrorHandler.js";
import mongoose from "mongoose";

const createLibrary = AsyncErrorHandler(async (req, res) => {
	const { name, location, contactNo, contactEmail } = req.body;

	if (!name || !location || !contactNo || !contactEmail) {
		res.status(400);
	}

	const newLibrary = new Library({
		name,
		location,
		contactNo,
		contactEmail,
		totalBooks: 0,
	});
	await newLibrary.save();
	res.json(newLibrary);
});

const getAllLibraries = AsyncErrorHandler(async (req, res) => {
	const libraries = await Library.find();
	libraries.id = libraries._id;
	res.json(libraries);
});

const getLibrary = AsyncErrorHandler(async (req, res) => {
	const { libraryId } = req.params;
	if (!libraryId) {
		res.status(400);
	}

	const library = await Library.findById(libraryId);

	if (!library) {
		res.status(400);
	}
	res.json(library);
});

const updateLibrary = AsyncErrorHandler(async (req, res) => {
	const { libraryId } = req.params;
	if (!libraryId) {
		res.status(400);
	}
	const { name, location, contactNo, contactEmail, librarian } = req.body;

	const updateLibrary = await Library.findByIdAndUpdate(
		{ _id: mongoose.Types.ObjectId(libraryId) },
		{
			name,
			location,
			contactNo,
			contactEmail,
			librarian: mongoose.Types.ObjectId(librarian),
		}
	);

	if (!updateLibrary) {
		res.status(400);
	}

	res.json(updateLibrary);
});

const assignLibrarian = AsyncErrorHandler(async (req, res) => {
	const { libraryId, userId } = req.body;
	if (!libraryId || !userId) {
		res.status(400).json({ message: "All fields are required" });
	}

	const library = await Library.findById(libraryId);
	if (!library) {
		res.status(400).json({ message: "Library not found" });
	}

	const user = await User.findById(userId);
	if (!user) {
		res.status(400).json({ message: "User not found" });
	}

	library.librarian = user._id;
	await library.save();
	res.json(library);
});

const deleteLibrary = AsyncErrorHandler(async (req, res) => {
	const { libraryId } = req.params;
	if (!libraryId) {
		res.status(400);
	}

	const deleteLibrary = await Library.findByIdAndDelete({
		_id: mongoose.Types.ObjectId(libraryId),
	});
	if (!deleteLibrary) {
		res.status(400);
	}
	res.json(deleteLibrary);
});

const getLibraryBooks = AsyncErrorHandler(async (req, res) => {
	const { libraryId } = req.params;
	if (!libraryId) {
		res.status(400);
	}
	const library = await Library.findById(libraryId);
	if (!library) {
		res.status(400);
	}

	const locations = await Location.find({ libraryId: libraryId }).populate(
		"bookId"
	);
	const books = [];
	for (const location of locations) {
		books.push(location.bookId);
	}

	res.json(books);
});

export {
	createLibrary,
	getAllLibraries,
	getLibrary,
	updateLibrary,
	getLibraryBooks,
	assignLibrarian,
	deleteLibrary,
};
