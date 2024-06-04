import mongoose from "mongoose";
import User from "../../_models/users/user.model.js";
import Book from "../../_models/books/book.model.js";
import Issue from "../../_models/Issue/issue.model.js";
import Rating from "../../_models/Rating/ratings.model.js";
import Location from "../../_models/locations/locations.model.js";
import AsyncErrorHandler from "../../middlewares/AsyncErrorHandler.js";
import Library from "../../_models/Library/library.model.js";

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
    deadline: Date.now() + library.issuePeriod * 24 * 60 * 60 * 1000,
  });
  await issue.save();

  location.availableQuantity--;
  await location.save();
  res.status(201).json({ message: "Book issued successfully" });
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

export {
  getBookDetails,
  modifyBookDetails,
  getBooks,
  rateBook,
  issueBookToUser,
  checkAvailability,
  getUserIssues,
  requestRenewal,
};
