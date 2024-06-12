import mongoose from "mongoose";
import User from "../../_models/users/user.model.js";
import Book from "../../_models/books/book.model.js";
import Issue from "../../_models/Issue/issue.model.js";
import Rating from "../../_models/Rating/ratings.model.js";
import Location from "../../_models/locations/locations.model.js";
import AsyncErrorHandler from "../../middlewares/AsyncErrorHandler.js";
import Library from "../../_models/Library/library.model.js";
import Fine from "../../_models/fine/fine.model.js";
import Transaction from "../../_models/transaction/transaction.model.js";

import { sendIssueStatusEmail } from "../../lib/nodemailer.js";

//Book details
const getBookDetails = AsyncErrorHandler(async (req, res) => {
	const { id: bookId } = req.params;

	if (!bookId) {
		res.status(400).json({ message: "bookId is required" });
		return;
	}
	const bookDetails = await Book.findById(bookId);
	if (!bookDetails) {
		res.status(404).send({ message: "Book not found!" });
		return;
	}
	res.json(bookDetails);
});

const getBookDetailsViaIsbn = AsyncErrorHandler(async (req, res) => {
	const { isbn } = req.params;
	if (!isbn) {
		res.status(400).send("ISBN not found!");
		return;
	}
	const bookDetails = await Book.findOne({
		$or: [{ isbn10: isbn }, { isbn13: isbn }],
	});
	if (!bookDetails) {
		res.status(404).send("Book not found!");
		return;
	}
	res.json(bookDetails);
});

//Update book details
const modifyBookDetails = AsyncErrorHandler(async (req, res) => {
	const { id: bookId } = req.params;
	const newDetails = req.body;

	if (!bookId || !newDetails) {
		res.status(400);
		return;
	}

	const updateBookDetails = await Book.updateOne(
		{ _id: new mongoose.Types.ObjectId(bookId) },
		{
			$set: newDetails,
		}
	);

	if (!updateBookDetails) {
		res.status(404);
		return;
	}
	res.json(updateBookDetails);
});

//get all books
const getBooks = AsyncErrorHandler(async (req, res) => {
	// const allBooks = await Book.find().populate("genre");
	const allBooks = await Book.aggregate([
		{
			$lookup: {
				from: "locations",
				as: "locations",
				localField: "_id",
				foreignField: "bookId",
			},
		},

		{
			$lookup: {
				from: "genres",
				as: "genre",
				localField: "genre",
				foreignField: "_id",
			},
		},

		{
			$unwind: "$genre",
		},
	]);

	// console.log(allBooks);
	if (!allBooks || allBooks.length === 0) {
		res.status(404).json({ message: "No books found" });
		return;
	}
	res.json(allBooks);
});

//Rate book
const rateBook = AsyncErrorHandler(async (req, res) => {
	const { id: bookId } = req.params;
	const { userId, rating } = req.body;

	if (!bookId || !userId || !rating || rating < 1 || rating > 5) {
		res.status(400).send("Invalid request parameters.");
		return;
	}

	const book = await Book.findById(bookId);
	if (!book) {
		res.status(404).send("Book not found.");
		return;
	}

	const existingRating = await Rating.findOne({ bookId, userId });
	if (existingRating) {
		// Update rating
		existingRating.rating = rating;
		await existingRating.save();
	} else {
		const newRating = new Rating({ bookId, userId, rating });
		await newRating.save();
	}

	// Calculate the average rating for the book
	const ratings = await Rating.find({ bookId }).select("rating");
	const totalRatings = ratings.length;
	const sumOfRatings = ratings.reduce((acc, curr) => acc + curr.rating, 0);
	const averageRating = totalRatings > 0 ? sumOfRatings / totalRatings : 0;

	res.json({ averageRating });
});

//issue book by ID
const issueBookToUser = AsyncErrorHandler(async (req, res) => {
	const userId = req.user;
	const { bookId, libraryId } = req.body;

	if (!userId || !bookId || !libraryId) {
		res.status(400).json({ message: "Invalid input data" });
		return;
	}

	const user = await User.findById(userId);
	if (!user) {
		res.status(404).json({ message: "User not found" });
		return;
	}

	const library = await Library.findById(libraryId);
	if (!library) {
		res.status(404).json({ message: "Library not found" });
		return;
	}

	const book = await Book.findById(bookId);
	if (!book) {
		res.status(404).json({ message: "Book not found" });
		return;
	}
	const location = await Location.findOne({ bookId, libraryId });
	if (!location) {
		res.status(404).json({ message: "Book not found in library" });
		return;
	}

	if (location.availableQuantity <= 0) {
		res.status(400).json({ message: "Book not available" });
		return;
	}

	const issue = new Issue({
		userId,
		bookId,
		libraryId,
		date: Date.now(),
		deadline: new Date(
			Date.now() + library.issuePeriod * 24 * 60 * 60 * 1000
		).setHours(0, 0, 0, 0),
	});
	await issue.save();
	issue.userId = user;
	issue.bookId = book;
	issue.libraryId = library;
	sendIssueStatusEmail(user.email, issue);
	res.status(201).json({
		message: "Book issue request sent successfully to the librarian",
		issue,
	});
});

const checkAvailability = AsyncErrorHandler(async (req, res) => {
	const { bookId } = req.body;

	if (!bookId) {
		res.status(400).json({ message: "Invalid input data" });
		return;
	}

	const locations = await Location.find({ bookId: bookId })
		.populate("libraryId")
		.populate("bookId");
	if (!locations || locations.length === 0) {
		res.status(404).json({ message: "Book not found" });
		return;
	}

	const availableLocations = [];

	for (const location of locations) {
		availableLocations.push({
			libraryId: location.libraryId,
			totalQuantity: location.totalQuantity,
			availableQuantity: location.availableQuantity,
		});
	}

	res.json({ availableLocations });
});

const getUserIssues = AsyncErrorHandler(async (req, res) => {
	const userId = req.user;

	if (!userId) {
		res.status(400).json({ message: "Invalid input data" });
		return;
	}

	const user = await User.findById(userId);
	if (!user) {
		res.status(404).json({ message: "User not found" });
		return;
	}

	const issues = await Issue.find({ userId });
	if (!issues || issues.length === 0) {
		res.status(404).json({ message: "No issues found" });
		return;
	}

	res.json({ issues });
});

const requestRenewal = AsyncErrorHandler(async (req, res) => {
	const userId = req.user;
	const { issueId } = req.body;
	if (!issueId) {
		res.status(400).json({ message: "Invalid input data" });
		return;
	}

	const issue = await Issue.findById(issueId);

	if (!issue) {
		res.status(404).json({ message: "Issue not found" });
		return;
	}

	if (issue.userId.toString() !== userId.toString()) {
		res.status(401).json({ message: "Unauthorized access" });
		return;
	}

	if (issue.status !== "issued") {
		res.status(400).json({ message: "Issue not issued" });
		return;
	}

	issue.status = "renew-requested";
	await issue.save();
	res.json({ message: "Renewal requested successfully" });
});

const reportLost = AsyncErrorHandler(async (req, res) => {
	const { issueId } = req.body;
	if (!issueId) {
		res.status(400).json({ message: "Invalid input data" });
		return;
	}

	const issue = await Issue.findById(issueId)
		.populate("bookId")
		.populate("libraryId");
	if (!issue) {
		res.status(404).json({ message: "Issue not found" });
		return;
	}

	if (issue.status !== "issued") {
		res.status(400).json({ message: "Issue not issued" });
		return;
	}

	if (issue.userId.toString() !== req.user.toString()) {
		res.status(401).json({ message: "Unauthorized access" });
		return;
	}

	issue.status = "fining";
	await issue.save();

	const fine = new Fine({
		userId: issue.userId,
		issueId,
		amount: issue.bookId.price,
		status: "Pending",
		category: "Lost or damaged",
		interest: issue.libraryId.fineInterest,
	});
	await fine.save();

	const location = await Location.findOne({ bookId: issue.bookId._id });
	if (!location) {
		res.status(404).json({ message: "Location not found" });
		return;
	}

	location.totalQuantity--;
	await location.save();

	res.json({ message: "Fine reported successfully", fine });
});

const getFines = AsyncErrorHandler(async (req, res) => {
	const userId = req.user;
	if (!userId) {
		res.status(400).json({ message: "Invalid input data" });
		return;
	}

	const user = await User.findById(userId);
	if (!user) {
		res.status(404).json({ message: "User not found" });
		return;
	}

	const fines = await Fine.find({ userId });
	if (!fines || fines.length === 0) {
		res.status(404).json({ message: "No fines found" });
		return;
	}

	res.json({ fines });
});

const payFine = AsyncErrorHandler(async (req, res) => {
	const { fineId } = req.body;
	if (!fineId) {
		res.status(400).json({ message: "Invalid input data" });
		return;
	}

	const fine = await Fine.findById(fineId).populate("issueId");
	if (!fine) {
		res.status(404).json({ message: "Fine not found" });
		return;
	}

	const issue = await Issue.findById(fine.issueId);
	if (!issue) {
		res.status(404).json({ message: "Issue not found" });
		return;
	}

	if (fine.userId.toString() !== req.user.toString()) {
		res.status(401).json({ message: "Unauthorized access" });
		return;
	}

	if (fine.status === "Completed") {
		res.status(400).json({ message: "Fine already paid" });
		return;
	}

	if (fine.status === "Revoked") {
		res.status(400).json({ message: "Fine revoked" });
		return;
	}

	if (fine.status === "Pending" && fine.category === "Due date exceeded") {
		res.status(400).json({
			message: "Fine not eligible for payment, return the book first",
		});
		return;
	}

	issue.status = "fined";
	await issue.save();

	const transaction = new Transaction({
		fineId: fine._id,
		amount: fine.amount,
	});
	await transaction.save();

	fine.transactionId = transaction._id;
	fine.status = "Completed";
	await fine.save();

	res.json({ message: "Fine paid successfully" });
});

export {
	getBookDetails,
	getBookDetailsViaIsbn,
	modifyBookDetails,
	getBooks,
	rateBook,
	issueBookToUser,
	checkAvailability,
	getUserIssues,
	requestRenewal,
	reportLost,
	getFines,
	payFine,
};
