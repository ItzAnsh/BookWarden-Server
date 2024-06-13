import User from "../../_models/users/user.model.js";
import AsyncErrorHandler from "../../middlewares/AsyncErrorHandler.js";
import jwt from "jsonwebtoken";
import Issue from "../../_models/Issue/issue.model.js";
import Book from "../../_models/books/book.model.js";
import Fine from "../../_models/fine/fine.model.js";
import Prefrence from "../../_models/prefrences/prefrence.model.js";
import Genre from "../../_models/books/genre.model.js";
import Rating from "../../_models/Rating/ratings.model.js";
import Wishlist from "../../_models/Wishlist/wishlist.model.js";
import mongoose from "mongoose";

const getUserDetails = AsyncErrorHandler(async (req, res) => {
	const id = req.user;
	if (!id) {
		res.status(400).json({ message: "Invalid user" });
		return;
	}

	const user = await User.findById(id).select("-password");
	if (!user) {
		res.status(400).json({ message: "User not found" });
		return;
	}

	const issues = await Issue.find({ userId: user._id })
		.populate("bookId")
		.populate("libraryId");
	if (!issues) {
		res.status(404).json({ message: "Issues not found" });
		return;
	}

	const fines = await Fine.find({ userId: user._id });
	if (!fines) {
		res.status(404).json({ message: "Fines not found" });
		return;
	}
	res.json({ user, issues, fines });
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
		return;
	}

	const user = await User.findById({ _id: id });
	if (!user) {
		res.status(400).json({ message: "User not found" });
		return;
	}

	if (!(await user.matchPassword(oldPassword))) {
		res.status(400).json({ message: "Invalid credentials" });
		return;
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
		return;
	}

	const issuedBooks = await Issue.find({ userId: id }).populate("bookId");
	if (!issuedBooks) {
		res.status(400).json({ message: "Issue not found" });
		return;
	}
	res.json(issuedBooks);
});

//FINE FOR LOST BOOK
const payFineForLostBook = async (req, res) => {
	const { issueId } = req.body;

	const issue = await Issue.findById(issueId);
	if (!issue) {
		return res.status(404).send("Issue not found!");
	}

	const fine = await Fine.findOne({ issueId: issue._id });
	if (!fine) {
		return res.status(404).send("Fine not found!");
	}

	fine.transaction = {
		userId: issue.userId,
		bookId: issue.bookId,
		amount: Book.price,
		type: "Lost Book Payment",
	};

	fine.status = "fined";
	await fine.save();

	res.json({ message: `Payment for lost book successfully processed.` });
};

const requestFinePaymentForOverdueBook = async (req, res) => {
	const { issueId } = req.body;
	const issue = await Issue.findOne(issueId);
	if (!issue) {
		return res.status(404).send("Issue not found!");
	}

	const daysOverdue = calculateDaysOverdue(issue.deadline);
	if (daysOverdue <= 0) {
		return res.status(400).send("Book is not overdue yet!");
	}

	const fineAmount = calculateOverdueFine(daysOverdue);
	const fine = new Fine({
		issueId: issue._id,
		amount: fineAmount,
		status: "Pending",
		fCategory: "Due date exceeded",
		transactionId: null,
	});

	await fine.save();
	res.json({
		message: `Fine payment request for overdue book submitted successfully.`,
	});
};

const payFineForOverdueBook = async (req, res) => {
	const { requestId } = req.body;

	const fine = await Fine.findById(requestId);

	if (!fine) {
		return res.status(404).send("Fine not found!");
	}

	if (fine.status !== "Approved") {
		return res.status(400).send("Fine has not been approved yet!");
	}

	// Perform payment process if needed...

	fine.status = "Completed";
	await fine.save();

	res.json({ message: `Fine payment completed successfully.` });
};

const calculateOverdueFine = (daysOverdue) => {
	const fineRatePerDay = 20; ///-----
	return fineRatePerDay * daysOverdue;
};

const calculateDaysOverdue = (returnDate) => {
	const currentDate = new Date();
	const diffInMs = currentDate.getTime() - returnDate.getTime();
	const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
	return Math.max(0, diffInDays);
};

const createPrefrenceList = AsyncErrorHandler(async (req, res) => {
	const userId = req.user;
	if (!userId) {
		return res.status(400).send({ message: "Invalid input data!" });
	}

	const user = await User.findById(userId);
	if (!user) {
		return res.status(404).send("User not found!");
	}

	const existingPrefrenceList = await Prefrence.findOne({ userId });
	if (existingPrefrenceList) {
		return res.status(400).send({ message: "Prefrence list already exists!" });
	}

	const prefrenceList = new Prefrence({
		userId,
		genres: [],
	});
	await prefrenceList.save();
	res.json({ message: "Prefrence list created successfully.", prefrenceList });
});

const addToPrefrenceList = AsyncErrorHandler(async (req, res) => {
	const userId = req.user;
	const { genres } = req.body;
	if (!userId) {
		return res.status(400).send({ message: "Invalid input data!" });
	}

	const user = await User.findById(userId);
	if (!user) {
		return res.status(404).send({ message: "User not found!" });
	}

	const prefrenceList = await Prefrence.findOne({ userId });
	if (!prefrenceList) {
		return res.status(404).send({ message: "Prefrence list not found!" });
	}

	for (const genreId of genres) {
		const genre = await Genre.findById(genreId);
		if (!genre) {
			console.log("Genre not found:", genreId);
			continue;
		}

		prefrenceList.genres.push(genre);
	}

	await prefrenceList.save();
	res.json({
		message: "Genre added to prefrence list successfully.",
		prefrenceList,
	});
});

const getPrefrenceList = AsyncErrorHandler(async (req, res) => {
	const userId = req.user;
	if (!userId) {
		return res.status(400).send({ message: "Invalid input data!" });
	}

	const user = await User.findById(userId);
	if (!user) {
		return res.status(404).send({ message: "User not found!" });
	}

	const prefrenceList = await Prefrence.findOne({ userId });
	if (!prefrenceList) {
		return res.status(404).send({ message: "Prefrence list not found!" });
	}

	res.json({ prefrenceList });
});

const removeFromPrefrenceList = AsyncErrorHandler(async (req, res) => {
	const userId = req.user;
	const { genres } = req.body;
	if (!userId) {
		return res.status(400).send({ message: "Invalid input data!" });
	}

	const user = await User.findById(userId);
	if (!user) {
		return res.status(404).send({ message: "User not found!" });
	}

	const prefrenceList = await Prefrence.findOne({ userId });
	if (!prefrenceList) {
		return res.status(404).send({ message: "Prefrence list not found!" });
	}

	for (const genreId of genres) {
		const genre = await Genre.findById(genreId);
		if (!genre) {
			console.log("Genre not found:", genreId);
		}
	}

	await prefrenceList.save();
	res.json({
		message: "Genre removed from prefrence list successfully.",
		prefrenceList,
	});
});

const getUserHome = AsyncErrorHandler(async (req, res) => {
	const findBooks = await Prefrence.findOne({ userId: req.user });

	if (!findBooks) {
		res.status(404).json({ message: "Prefrences not found" });
		return;
	}

	findBooks.genres.forEach((genre) => {
		genre = new mongoose.Types.ObjectId(genre);
	});
	console.log(findBooks);

	const pipeline = [
		{
			$facet: {
				PreferredBooks: [
					{
						$match: {
							genre: {
								$in: findBooks.genres,
							},
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
				],

				Categories: [
					{
						$lookup: {
							from: "genres",
							as: "AllGenres",
							pipeline: [
								{
									$match: {},
								},
							],
						},
					},

					{
						$limit: 1,
					},
				],

				RecentBooks: [
					{
						$sort: {
							date: -1,
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

					{
						$limit: 12,
					},
				],

				UpcomingDeadlines: [
					{
						$lookup: {
							from: "issues",
							as: "issues",
							pipeline: [
								{
									$match: {
										userId: new mongoose.Types.ObjectId(req.user),
									},
								},
								{
									$lookup: {
										from: "books",
										as: "bookId",
										localField: "bookId",
										foreignField: "_id",
										pipeline: [
											{
												$match: {},
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
										],
									},
								},
								{
									$lookup: {
										from: "libraries",
										as: "libraryId",
										localField: "libraryId",
										foreignField: "_id",
									},
								},

								{
									$project: {
										_id: 0,
										bookId: 1,
										deadline: 1,
									},
								},
							],
						},
					},
				],
			},
		},
	];

	const details = await Book.aggregate(pipeline);

	res.status(200).json(details[0]);
});

const getMyProfile = AsyncErrorHandler(async (req, res) => {
	const pipeline = [
		{
			$facet: {
				UserDetails: [
					{
						$match: {
							_id: new mongoose.Types.ObjectId(req.user),
						},
					},
					{
						$project: {
							_id: 1,
							name: 1,
							email: 1,
							role: 1,
							date: 1,
						},
					},
				],

				IssuedBooks: [
					{
						$lookup: {
							from: "issues",
							as: "issuedBooks",
							pipeline: [
								{
									$match: {
										userId: new mongoose.Types.ObjectId(req.user),
									},
								},
								{
									$lookup: {
										from: "books",
										as: "bookId",
										localField: "bookId",
										foreignField: "_id",
									},
								},
								{
									$lookup: {
										from: "libraries",
										as: "libraryId",
										localField: "libraryId",
										foreignField: "_id",
									},
								},
								// {
								// 	$project: {
								// 		_id: 1,
								// 		bookId: {
								// 			_id: 1,
								// 			title: 1,
								// 			author: 1,
								// 			description: 1,
								// 			price: 1,
								// 			publisher: 1,
								// 			length: 1,
								// 			imageURL: 1,
								// 			isbn10: 1,
								// 			isbn13: 1,
								// 		},
								// 		date: 1,
								// 		deadline: 1,
								// 		libraryId: {
								// 			_id: 1,
								// 			name: 1,
								// 			location: 1,
								// 			contactNo: 1,
								// 			librarianEmail: 1,
								// 			issuePeriod: 1,
								// 			fineInterest: 1,
								// 		},
								// 		status: 1,
								// 	},
								// },
							],
						},
					},
					{
						$project: {
							issuedBooks: 1,
							_id: 0,
						},
					},
					{
						$limit: 1,
					},
				],

				Fines: [
					{
						$lookup: {
							from: "fines",
							as: "fines",
							pipeline: [
								{
									$match: {
										userId: new mongoose.Types.ObjectId(req.user),
									},
								},
								{
									$lookup: {
										from: "issues",
										as: "issueId",
										pipeline: [
											{
												$match: {
													userId: new mongoose.Types.ObjectId(req.user),
												},
											},
											{
												$lookup: {
													from: "books",
													as: "bookId",
													localField: "bookId",
													foreignField: "_id",
												},
											},
											// {
											// 	$project: {
											// 		bookId: {
											// 			_id: 1,
											// 			title: 1,
											// 			author: 1,
											// 			description: 1,
											// 			price: 1,
											// 			publisher: 1,
											// 			length: 1,
											// 			imageURL: 1,
											// 			isbn10: 1,
											// 			isbn13: 1,
											// 		},
											// 	},
											// },
										],
									},
								},
								{
									$lookup: {
										from: "libraries",
										as: "libraryId",
										localField: "libraryId",
										foreignField: "_id",
									},
								},
								// {
								// 	$project: {
								// 		userId: 0,
								// 	},
								// },
							],
						},
					},
					{
						$project: {
							fines: 1,
							_id: 0,
						},
					},
					{
						$limit: 1,
					},
				],
			},
		},
	];

	const userHomeDetails = await User.aggregate(pipeline);

	// console.log(userHomeDetails);

	res.status(200).json(userHomeDetails[0]);
	return;
});

const giveRating = AsyncErrorHandler(async (req, res) => {
	const userId = req.user;
	const { ratingNumber, ratingText, bookId } = req.body;
	if (!userId) {
		return res.status(400).send({ message: "Invalid input data!" });
	}

	const user = await User.findById(userId);
	if (!user) {
		return res.status(404).send({ message: "User not found!" });
	}
	const book = await Book.findById(bookId);
	if (!book) {
		return res.status(404).send({ message: "Book not found!" });
	}

	const rating = new Rating({
		userId,
		bookId,
		rating: ratingNumber,
		text: ratingText,
	});
	await rating.save();
	rating.userId = user;
	rating.bookId = book;
	res.json({ message: "Rating given successfully.", rating });
});

const getBookRatings = AsyncErrorHandler(async (req, res) => {
	const userId = req.user;
	const { bookId } = req.params;
	if (!userId) {
		return res.status(400).send({ message: "Invalid input data!" });
	}

	const user = await User.findById(userId);
	if (!user) {
		return res.status(404).send({ message: "User not found!" });
	}

	const ratings = await Rating.find({ bookId })
		.populate("bookId")
		.populate({path : "userId", select: "-password"});
	if (!ratings) {
		return res.status(404).send({ message: "Rating not found!" });
	}
	let totalrating = 0;
	let i = 0;
	for (const rating of ratings) {
		totalrating += rating.rating;
		i++;
	}
	const averageRating = totalrating / i;

	res.json({ averageRating, ratings });
});

const likeBook = AsyncErrorHandler(async (req, res) => {
	const { bookId } = req.body;
	const userId = req.user;

	if (!bookId || !userId) {
		return res.status(400).send({ message: "Invalid input data!" });
	}

	const user = await User.findById(userId);
	if (!user) {
		return res.status(404).send({ message: "User not found!" });
	}

	const book = await Book.findById(bookId);

	if (!book) {
		return res.status(404).send({ message: "Book not found!" });
	}

	let wishlist = await Wishlist.findOne({ userId });
	if (!wishlist) {
		wishlist = new Wishlist({ userId, books: [bookId] });
		await wishlist.save();
		res.json({ message: "Book liked successfully." });
		return;
	}

	if (wishlist.books.includes(bookId)) {
		return res.status(400).send({ message: "Book already liked!" });
	}

	wishlist.books.push(bookId);
	await wishlist.save();
	res.json({ message: "Book liked successfully." });
});

const unlikeBook = AsyncErrorHandler(async (req, res) => {
	const { bookId } = req.body;
	const userId = req.user;

	if (!bookId || !userId) {
		return res.status(400).send({ message: "Invalid input data!" });
	}

	const user = await User.findById(userId);
	if (!user) {
		return res.status(404).send({ message: "User not found!" });
	}

	const book = await Book.findById(bookId);
	if (!book) {
		return res.status(404).send({ message: "Book not found!" });
	}

	const wishlist = await Wishlist.findOne({ userId });
	if (!wishlist) {
		return res.status(404).send({ message: "Wishlist not found!" });
	}

	if (!wishlist.books.includes(bookId)) {
		return res.status(400).send({ message: "Book not liked!" });
	}

	const index = wishlist.books.indexOf(bookId);
	wishlist.books.splice(index, 1);
	await wishlist.save();
	res.json({ message: "Book unliked successfully." });
});

const getLikes = AsyncErrorHandler(async (req, res) => {
	const userId = req.user;
	if (!userId) {
		return res.status(400).send({ message: "Invalid input data!" });
	}

	const user = await User.findById(userId);
	if (!user) {
		return res.status(404).send({ message: "User not found!" });
	}

	const wishlist = await Wishlist.findOne({ userId })
		.populate({ path: "books", populate: { path: "genre" } })
		.populate({path : "userId", select: "-password"});
	if (!wishlist) {
		return res.status(404).send({ message: "Wishlist not found!" });
	}
	res.json(wishlist);
});

export {
	getUserDetails,
	loginUser,
	updatePassword,
	getUserIssues,
	payFineForLostBook,
	requestFinePaymentForOverdueBook,
	payFineForOverdueBook,
	createPrefrenceList,
	addToPrefrenceList,
	getPrefrenceList,
	removeFromPrefrenceList,
	giveRating,
	getBookRatings,
	likeBook,
	unlikeBook,
	getLikes,
	getMyProfile,
	getUserHome,
};
