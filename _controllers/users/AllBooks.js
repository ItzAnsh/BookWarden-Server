import mongoose from "mongoose";
import User from "../../_models/users/user.model.js";
import Book from "../../_models/books/book.model.js";
import Issue from "../../_models/Issue/issue.model.js";
import Rating from "../../_models/Rating/ratings.model.js";
import AsyncErrorHandler from "../../middlewares/AsyncErrorHandler.js";

//Create book
const createBook = AsyncErrorHandler(async (req, res) => {
	const {
		title,
		author,
		description,
		price,
		genre,
		totalQuantity,
		availableQuantity,
		releasDate,
		publisher,
		language,
		length,
		imageUrl,
	} = req.body;

	// if (!title || !author || !description || !price || !genre || !totalQuantity || !availableQuantity || !releasDate || !publisher || !language || !length || !imageUrl) {
	//     res.status(400).send("Please enter all the book details!");
	//     return;
	// }

	// Create a new book instance
	const newBook = new Book({
		title,
		author,
		description,
		price,
		genre,
		totalQuantity,
		availableQuantity,
		releasDate,
		publisher,
		language,
		length,
		imageUrl,
	});

	// Save the new book to the database
	const savedBook = await newBook.save();

	if (!savedBook) {
		return Promise.reject("An error is occurring while creating book");
	}

	res.status(201).json(savedBook);
});

//Book details
const getBookDetails = AsyncErrorHandler(async (req, res) => {
	const { bookId } = req.params;

	if (!bookId) {
		res.status(400).send("Book id not found!");
		return;
	}
	const bookDetails = await bookDetails.findById(bookId);

	if (!bookDetails) {
		res.status(404).send("User id not found!");
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
	const allBooks = await Book.find();

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
	const userId = req.params.id;
	const { bookId } = req.body;

	if (!userId || !bookId) {
		res.status(400);
		return;
	}

	const book = await Book.findById(bookId);
	if (!book) {
		res.status(404);
		return;
	}

	const issue = new Issue({
		bookId: bookId,
		userId: userId,
		date: new Date(),
		deadline: new Date(),
		status: "issued",
	});

	await issue.save();

	res.json({ message: "Book successfully issued" });
});

export {
	createBook,
	getBookDetails,
	modifyBookDetails,
	getBooks,
	rateBook,
	issueBookToUser,
};
