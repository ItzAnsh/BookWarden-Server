import Book from "../../_models/books/book.model.js";
import User from "../../_models/users/user.model.js";
import Genre from "../../_models/books/genre.model.js";
import AsyncErrorHandler from "../../middlewares/AsyncErrorHandler.js";
import generateStrongPassword from "../../lib/generatePassword.js";
import {
  sendWelcomeEmail,
  sendIssueStatusEmail,
  sendRequestStatusEmail,
} from "../../lib/nodemailer.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Issue from "../../_models/Issue/issue.model.js";
import Library from "../../_models/Library/library.model.js";
import Location from "../../_models/locations/locations.model.js";
import Fine from "../../_models/fine/fine.model.js";
import { json } from "express";
import Request from "../../_models/requests/request.model.js";
import Prefrence from "../../_models/prefrences/prefrence.model.js";

const getLibraryDetails = AsyncErrorHandler(async (req, res) => {
  const librarianId = req.user;
  if (!librarianId) {
    res.status(400).json({ message: "Invalid Input data" });
    return;
  }

  const librarian = await User.findById(librarianId).select("-password");
  if (!librarian) {
    res.status(404).json({ message: "Librarian not found" });
    return;
  }

  const library = await Library.findOne({ librarian: librarian._id });
  if (!library) {
    res.status(404).json({ message: "Library not found" });
    return;
  }

  const books = await Location.find({ libraryId: library._id })
    .populate("bookId")
    .select("-libraryId");
  if (!books) {
    res.status(404).json({ message: "Books not found" });
    return;
  }

  const issues = await Issue.find({ libraryId: library._id })
    .populate("bookId")
    .select("-libraryId")
    .populate("userId");
  if (!issues) {
    res.status(404).json({ message: "Issues not found" });
    return;
  }

  const fines = await Fine.find({ libraryId: library._id })
    .populate("issueId")
    .populate("issueId.bookId")
    .populate("userId");
  if (!fines) {
    res.status(404).json({ message: "Fines not found" });
    return;
  }
  library.librarian = librarian;
  res.json({ library, books, issues, fines });
});

const getAllBooks = AsyncErrorHandler(async (req, res) => {
  const books = await Book.find();
  res.json(books);
});

const getBook = AsyncErrorHandler(async (req, res) => {
  const { bookId } = req.params;
  if (!bookId) {
    res.status(400).json({ message: "Invalid input data" });
    return;
  }

  const book = await Book.findOne({ _id: new mongoose.Types.ObjectId(bookId) });
  if (!book) {
    res.status(404).json({ message: "Book not found" });
    return;
  }

  res.json(book);
});

const createBook = AsyncErrorHandler(async (req, res) => {
  const {
    title,
    author,
    description,
    price,
    genre,
    publisher,
    language,
    length,
    releaseDate,
    imageURL,
    isbn10,
    isbn13,
  } = req.body;

  if (
    !title ||
    !author ||
    !description ||
    !price ||
    !genre ||
    !publisher ||
    !language ||
    !length ||
    !releaseDate ||
    !imageURL ||
    !isbn10 ||
    !isbn13
  ) {
    res.status(400).json("Please enter all the book details!");
    return;
  }
  const newBook = new Book({
    title,
    author,
    description,
    price,
    genre,
    publisher,
    language,
    length,
    releaseDate,
    imageURL,
    isbn10,
    isbn13,
  });
  await newBook.save();
  res.json(newBook);
});

const createMultipleBooks = AsyncErrorHandler(async (req, res) => {
  const books = req.body;
  if (!books || !Array.isArray(books)) {
    res.status(400).json({ message: "Invalid input data" });
    return;
  }

  const createdBooks = await Book.insertMany(books);
  res.json(createdBooks);
});

const addBookToLibrary = AsyncErrorHandler(async (req, res) => {
  const { bookId, totalQuantity, availableQuantity } = req.body;
  const librarianId = req.user;
  if (!bookId || !totalQuantity || !availableQuantity) {
    res.status(400).json({ message: "Invalid input data" });
    return;
  }
  const book = await Book.findById(bookId);
  if (!book) {
    res.status(404).json({ message: "Book not found" });
    return;
  }

  const library = await Library.findOne({ librarian: librarianId });
  if (!library) {
    res.status(400).json({ message: "Librarian not found" });
    return;
  }

  let location = await Location.findOne({
    libraryId: library._id,
    bookId: book._id,
  });
  if (location) {
    location.totalQuantity += totalQuantity;
    location.availableQuantity += availableQuantity;
    await location.save();
    res.json({
      message: "Existing book found, Location updated",
      location,
    });
  } else {
    location = new Location({
      libraryId: library._id,
      bookId: book._id,
      totalQuantity,
      availableQuantity,
    });
    await location.save();
    res.json(location);
  }

  library.totalBooks += totalQuantity;
  await library.save();
});

const addBookToLibraryViaIsbn = AsyncErrorHandler(async (req, res) => {
  const { isbn, totalQuantity, availableQuantity } = req.body;
  const librarianId = req.user;
  if (!isbn || !totalQuantity || !availableQuantity) {
    res.status(400).json({ message: "Invalid input data" });
  }
  const book = await Book.findOne({
    $or: [{ isbn10: isbn }, { isbn13: isbn }],
  });

  if (!book) {
    res.status(404).json({ message: "Book not found" });
    return;
  }

  const library = await Library.findOne({ librarian: librarianId });
  if (!library) {
    res.status(400).json({ message: "Librarian not found" });
    return;
  }

  let location = await Location.findOne({
    libraryId: library._id,
    bookId: book._id,
  });
  if (location) {
    location.totalQuantity += totalQuantity;
    location.availableQuantity += availableQuantity;
    await location.save();
    res.json({
      message: "Existing book found, Location updated",
      location,
    });
  } else {
    location = new Location({
      libraryId: library._id,
      bookId: book._id,
      totalQuantity,
      availableQuantity,
    });
    await location.save();
  }

  library.totalBooks += totalQuantity;
  await library.save();
  res.json(location);
});

const removeBooksFromLibrary = AsyncErrorHandler(async (req, res) => {
  const { locationId } = req.body;
  const librarianId = req.user;
  if (!locationId) {
    res.status(400).send("Book id not found!");
  }

  const library = await Library.findOne({ librarian: librarianId });
  if (!library) {
    res.status(400).json({ message: "Library not found" });
    return;
  }

  const location = await Location.findById(locationId);
  if (!location) {
    res.status(404).json({ message: "Location not found" });
    return;
  }

  const issues = await Issue.find({
    libraryId: library._id,
    bookId: location.bookId,
  });

  if (issues.length > 0) {
    res.status(400).json({
      message: "Books in library cannot be deleted, they have issues",
    });
    return;
  }

  if (issues.length > 0) {
    res.status(400).json({ message: "Location is not empty" });
    return;
  }

  const deletedLocation = await Location.findByIdAndDelete(locationId);

  if (!deletedLocation) {
    res.status(404).json({ message: "Location not deleted" });
    return;
  }

  library.totalBooks -= location.totalQuantity;
  await library.save();
  res.json(location);
});

const updateBooksInLibrary = AsyncErrorHandler(async (req, res) => {
  const { locationId, totalQuantity, availableQuantity } = req.body;
  const librarianId = req.user;
  if (!locationId) {
    res.status(400).send("Book id not found!");
  }
  const library = await Library.findOne({ librarian: librarianId });
  const location = await Location.findByIdAndUpdate(locationId, {
    totalQuantity,
    availableQuantity,
  });
  if (!location) {
    res.status(404).json({ message: "Location not found" });
    return;
  }

  library.totalBooks += totalQuantity - location.totalQuantity;
  await library.save();
  location.totalQuantity = totalQuantity;
  location.availableQuantity = availableQuantity;
  res.json({ location, library });
});

const updateBook = AsyncErrorHandler(async (req, res) => {
  const { bookId } = req.params;
  if (!bookId) {
    res.status(400).send("Book id not found!");
  }
  const {
    title,
    author,
    description,
    price,
    genre,
    totalQuantity,
    availableQuantity,
    publisher,
    language,
    length,
    releaseDate,
    imageURL,
    isbn10,
    isbn13,
  } = req.body;

  const updateBook = await Book.findOneAndUpdate(bookId, {
    title,
    author,
    description,
    price,
    genre,
    totalQuantity,
    availableQuantity,
    publisher,
    language,
    length,
    releaseDate,
    imageURL,
    isbn10,
    isbn13,
  });

  if (!updateBook) {
    res.status(400).json({ message: "Book not Updated" });
    return;
  }

  res.json(updateBook);
});

const deleteBook = AsyncErrorHandler(async (req, res) => {
  const { bookId } = req.params;
  if (!bookId) {
    res.status(404).json({ message: "Book not found" });
    return;
  }

  const deleteBook = await Book.findByIdAndDelete(bookId);
  if (!deleteBook) {
    res.status(400).json({ message: "Book not found" });
    return;
  }

  res.json(deleteBook);
});

const getAllUsers = AsyncErrorHandler(async (req, res) => {
  const users = await User.find();
  res.json(users);
});

const getSpecificUser = AsyncErrorHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    res.status(400).json({ message: "Invalid input data" });
    return;
  }

  const user = await User.findOne({ _id: new mongoose.Types.ObjectId(userId) });
  if (!user) {
    res.status(400).json({ message: "User not found" });
    return;
  }
  res.json(user);
});

const createGenre = AsyncErrorHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  const existingGenre = await Genre.findOne({ name });
  if (existingGenre) {
    res.status(400).json({ message: "Genre already exists" });
    return;
  }

  const newGenre = new Genre({ name });
  await newGenre.save();
  res.json(newGenre);
});

const createUser = AsyncErrorHandler(async (req, res) => {
  const id = req.user;
  const { name, email } = req.body;

  if (!name || !email) {
    res.status(400).json({
      message: "All fields are required",
    });
    return;
  }

  const librarian = await User.findById(id);
  if (!librarian) {
    res.status(400).json({ message: "Librarian not found" });
    return;
  }

  if (librarian.role !== process.env.LIBRARIAN_KEY) {
    res.status(400).json({ message: "Not a librarian" });
    return;
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400).json({ message: "User already exists" });
    return;
  }

  const password = generateStrongPassword();

  const user = await User.create({
    name,
    email,
    password,
    adminId: librarian.adminId,
  });
  if (!user) {
    res.status(400).json({ message: "Failed to create user" });
    return;
  }

  const prefrenceList = new Prefrence({
    userId: user._id,
    genres: [],
  });
  await prefrenceList.save();

  sendWelcomeEmail(email, password, name);
  res.json({ user, password });
});

const createMultipleUser = AsyncErrorHandler(async (req, res) => {
  const id = req.user;
  const { users } = req.body;

  if (!users || !Array.isArray(users)) {
    res.status(400).json({ message: "Invalid input data" });
    return;
  }

  const librarian = await User.findById(id);
  if (!librarian) {
    res.status(400).json({ message: "Librarian not found" });
    return;
  }

  if (librarian.role !== process.env.LIBRARIAN_KEY) {
    res.status(400).json({ message: "Not a librarian" });
    return;
  }

  const createdUsers = [];
  const emailContent = [];
  const prefrenceLists = [];

  for (const user of users) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists:", user.email);
      continue;
    }

    const { name, email } = user;

    if (!name || !email) {
      console.log("All fields are required for " + user.email);
      continue;
    }

    const password = generateStrongPassword();

    createdUsers.push({
      name,
      email,
      password,
      adminId: librarian.adminId,
    });

    emailContent.push({
      email,
      password,
      name,
    });

    prefrenceLists.push({
      userId: user._id,
      genres: [],
    });
  }
  await User.insertMany(createdUsers);
  await Prefrence.insertMany(prefrenceLists);
  for (const email of emailContent) {
    sendWelcomeEmail(email.email, email.password, email.name);
  }

  res.json({ createdUsers });
});

const loginLibrarian = AsyncErrorHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }
  const user = await User.findOne({ email: email });
  console.log(user);
  if (!user) {
    res.status(400).json({ message: "User not found" });
    return;
  }
  if (user.role !== process.env.LIBRARIAN_KEY) {
    res.status(400).json({ message: "Not a librarian" });
    return;
  }

  if (!(await user.matchPassword(password))) {
    res.status(400).json({ message: "Invalid credentials" });
    return;
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({ token });
});

const getAllIssues = AsyncErrorHandler(async (req, res) => {
  const issues = await Issue.find().populate({
    path : "bookId",
    populate : "genre"
  }).populate({
    path: "userId",
    select: "-password",
  })
  .populate({
    path: "libraryId",
  });
  issues.sort((a, b) => b.date - a.date);
  res.json(issues);
});

const getLibraryIssues = AsyncErrorHandler(async (req, res) => {
  const librarianId = req.user;
  if (!librarianId) {
    res.status(400).json({ message: "Librarian not found" });
    return;
  }

  const librarian = await User.findById(librarianId);
  if (!librarian) {
    res.status(400).json({ message: "Librarian not found" });
    return;
  }

  if (librarian.role !== process.env.LIBRARIAN_KEY) {
    res.status(400).json({ message: "Not a librarian" });
    return;
  }

  const library = await Library.findOne({ librarian: librarian._id });
  if (!library) {
    res.status(400).json({ message: "Library not found" });
    return;
  }

  const issues = await Issue.find({ libraryId: library._id })
    .populate("bookId")
    .populate("userId");
  issues.sort((a, b) => b.date - a.date);
  res.json(issues);
});

const approveIssue = AsyncErrorHandler(async (req, res) => {
  const { issueId } = req.body;

  if (!issueId) {
    res.status(400);
    return;
  }

  const issue = await Issue.findById(issueId)
    .populate("bookId")
    .populate("userId")
    .populate("libraryId");
  if (!issue) {
    res.status(400).json({ message: "Issue not found" });
    return;
  }

  const location = await Location.findOne({
    bookId: issue.bookId._id,
    libraryId: issue.libraryId,
  });
  if (!location) {
    res.status(400).json({ message: "Location not found" });
    return;
  }

  if (issue.libraryId.librarian.toString() !== req.user.toString()) {
    res.status(400).json({ message: "Not authorized, This is not your issue" });
    return;
  }

  if (issue.status === "issued") {
    res.status(400).json({ message: "Issue already Approved" });
    return;
  }

  if (issue.status === "rejected") {
    res.status(400).json({ message: "Issue already rejected" });
    return;
  }
  issue.status = "issued";
  await issue.save();
  location.availableQuantity -= 1;
  await location.save();
  sendIssueStatusEmail(issue.userId.email, issue);
  res.json(issue);
});

const rejectIssue = AsyncErrorHandler(async (req, res) => {
  const { issueId } = req.body;

  if (!issueId) {
    res.status(400);
    return;
  }

  const issue = await Issue.findById(issueId)
    .populate("bookId")
    .populate("userId");
  if (!issue) {
    res.status(400).json({ message: "Issue not found" });
    return;
  }
  if (issue.status === "issued") {
    res.status(400).json({ message: "Issue already Approved" });
    return;
  }

  if (issue.status === "rejected") {
    res.status(400).json({ message: "Issue already rejected" });
    return;
  }

  issue.status = "rejected";
  await issue.save();
  sendIssueStatusEmail(issue.userId.email, issue);
  res.json(issue);
});

const getSpecificIssue = AsyncErrorHandler(async (req, res) => {
  const { issueId } = req.params;
  if (!issueId) {
    res.status(400).json({ message: "Invalid input data" });
    return;
  }

  const issue = await Issue.findById(issueId)
    .populate({
      path: "bookId",
      populate: {
        path: "genre",
      },
    })
    .populate({
      path: "userId",
      select: "-password",
    })
    .populate("libraryId");
  if (!issue) {
    res.status(400).json({ message: "Issue not found" });
    return;
  }
  res.json(issue);
});

const getRenewalRequests = AsyncErrorHandler(async (req, res) => {
  const renewals = await Issue.find({ status: "renew-requested" });
  res.json(renewals);
});

const approveRenewal = AsyncErrorHandler(async (req, res) => {
  const { issueId } = req.body;
  if (!issueId) {
    res.status(400).json({ message: "Invalid input data" });
    return;
  }

  const issue = await Issue.findById(issueId);
  if (!issue) {
    res.status(400).json({ message: "Issue not found" });
    return;
  }

  if (issue.status !== "renew-requested") {
    res.status(400).json({ message: "Renewal not requested" });
    return;
  }

  const fine = await Fine.findOne({ issueId: issue._id });
  if (fine) {
    res.status(400).json({ message: "Can't renew with fine" });
    return;
  }

  if (Date.now() > issue.deadline.getTime() - 2 * 24 * 60 * 60 * 1000) {
    res.status(400).json({ message: "Renewal deadline exceeded" });
    return;
  }

  const library = await Library.findById(issue.libraryId);
  if (!library) {
    res.status(400).json({ message: "Library not found" });
    return;
  }

  issue.status = "renew-approved";
  issue.deadline = new Date(
    issue.deadline.getTime() + library.issuePeriod * 24 * 60 * 60 * 1000
  );
  await issue.save();
  res.json({ message: "Renewal approved successfully", issue });
});

const rejectRenewal = AsyncErrorHandler(async (req, res) => {
  const { issueId } = req.body;
  if (!issueId) {
    res.status(400).json({ message: "Invalid input data" });
    return;
  }

  const issue = await Issue.findById(issueId);
  if (!issue) {
    res.status(400).json({ message: "Issue not found" });
    return;
  }

  if (issue.status !== "renew-requested") {
    res.status(400).json({ message: "Renewal not requested" });
    return;
  }

  issue.status = "renew-rejected";
  await issue.save();
  res.json({ message: "Renewal rejected successfully" });
});

const approveOverdueFine = AsyncErrorHandler(async (req, res) => {
  const { fineId } = req.body;
  if (!fineId) {
    res.status(400).json({ message: "Invalid input data" });
    return;
  }

  const fine = await Fine.findById(fineId);
  if (!fine) {
    res.status(400).json({ message: "Fine not found" });
    return;
  }

  if (fine.status !== "Pending") {
    res.status(400).json({ message: "Fine not pending" });
    return;
  }
  if (fine.category !== "Due date exceeded") {
    res.status(400).json({ message: "Fine not due date exceeded" });
    return;
  }

  fine.status = "Approved";
  await fine.save();
  res.json({ message: "Fine approved successfully" });
});

const approveReturn = AsyncErrorHandler(async (req, res) => {
  const { issueId } = req.body;
  if (!issueId) {
    res.status(400).json({ message: "Invalid input data" });
    return;
  }

  const issue = await Issue.findById(issueId)
    .populate("bookId")
    .populate("userId");
  if (!issue) {
    res.status(400).json({ message: "Issue not found" });
    return;
  }

  if (issue.status === "returned" || issue.status === "fined") {
    res.status(400).json({ message: "Issue already returned or fined" });
    return;
  }

  if (issue.status === "fining") {
    const fine = await Fine.findOne({ issueId });
    if (!fine) {
      res.status(400).json({ message: "Fine not found" });
      return;
    }
    if (fine.category == "Lost or damaged") {
      res.status(404).json({ message: "Can't return lost or damaged book" });
      return;
    }
    fine.status = "Approved";
    await fine.save();

    issue.status = "fining-returned";
    await issue.save();
    res.json({ message: "Book returned successfully, fine approved" });
  } else if (issue.status === "issued" || issue.status === "renew-approved") {
    issue.status = "returned";
    await issue.save();
    res.json({ message: "Book returned successfully" });
  } else {
    res.status(400).json({ message: "Issue not issued" });
    return;
  }
  const location = await Location.findOne({
    bookId: issue.bookId,
    libraryId: issue.libraryId,
  });
  if (!location) {
    res.status(400).json({ message: "Location not found" });
    return;
  }
  location.availableQuantity += 1;
  sendIssueStatusEmail(issue.userId.email, issue);
  await location.save();
});

const getLibraryFines = AsyncErrorHandler(async (req, res) => {
  const librarianId = req.user;
  if (!librarianId) {
    res.status(400).json({ message: "Librarian not found" });
    return;
  }

  const library = await Library.findOne({ librarian: librarianId });
  if (!library) {
    res.status(400).json({ message: "Library not found" });
    return;
  }

  const fines = await Fine.find({ libraryId: library._id });
  res.json(fines);
});

const revokeFine = AsyncErrorHandler(async (req, res) => {
  const { fineId } = req.body;
  if (!fineId) {
    res.status(400).json({ message: "Invalid input data" });
    return;
  }

  const fine = await Fine.findById(fineId).populate(
    "issueId issueId.libraryId"
  );
  if (!fine) {
    res.status(400).json({ message: "Fine not found" });
    return;
  }

  if (fine.issueId.libraryId.librarian.toString() !== req.user.toString()) {
    res.status(401).json({ message: "Unauthorized access" });
    return;
  }

  fine.status = "Revoked";
  await fine.save();
  res.json({ message: "Fine revoked successfully" });
});

const updateFine = AsyncErrorHandler(async (req, res) => {
  const { fineId, amount } = req.body;
  if (!fineId) {
    res.status(400).json({ message: "Invalid input data" });
    return;
  }

  const fine = await Fine.findById(fineId).populate(
    "issueId issueId.libraryId"
  );
  if (!fine) {
    res.status(400).json({ message: "Fine not found" });
    return;
  }

  if (fine.issueId.libraryId.librarian.toString() !== req.user.toString()) {
    res.status(401).json({ message: "Unauthorized access" });
    return;
  }

  fine.amount = amount;
  await fine.save();
  res.json({ message: "Fine updated successfully" });
});

const approveFinePaymentRequest = async (req, res) => {
  const { requestId } = req.body;

  const request = await FinePaymentRequest.findById(requestId);
  if (!request) {
    return res.status(404).send("Fine payment request not found!");
  }

  if (request.status === "Approved" || request.status === "Completed") {
    return res
      .status(400)
      .send("Fine payment request has already been approved or completed!");
  }

  request.status = "Approved";
  await request.save();

  res.json({ message: `Fine payment request approved successfully.` });
};

const getRequests = AsyncErrorHandler(async (req, res) => {
  const librarianId = req.user;
  const requests = await Request.find({ librarianId })
    .populate("bookId")
    .populate("libraryId")
    .populate("librarianId");
  res.json(requests);
});

const requestBooksToAdmin = AsyncErrorHandler(async (req, res) => {
  const { bookId, quantity } = req.body;
  const librarianId = req.user;

  if (!bookId || !quantity || !librarianId) {
    res.status(400).json({ message: "Invalid input data" });
    return;
  }

  const book = await Book.findById(bookId);
  if (!book) {
    res.status(404).json({ message: "Book not found" });
    return;
  }

  const librarian = await User.findById(librarianId);
  if (!librarian) {
    res.status(404).json({ message: "Librarian not found" });
    return;
  }

  const library = await Library.findOne({ librarian: librarianId });
  if (!library) {
    res.status(404).json({ message: "Library not found" });
    return;
  }

  const request = new Request({
    bookId,
    quantity,
    libraryId: library._id,
    adminId: library.adminId,
    librarianId,
  });

  await request.save();
  request.librarianId = librarian;
  request.bookId = book;
  sendRequestStatusEmail(librarian.email, request);
  res.json(request);
});

export {
  getLibraryDetails,
  getAllBooks,
  getBook,
  createBook,
  addBookToLibrary,
  addBookToLibraryViaIsbn,
  removeBooksFromLibrary,
  updateBooksInLibrary,
  updateBook,
  deleteBook,
  getAllUsers,
  getAllIssues,
  getLibraryIssues,
  getSpecificIssue,
  approveIssue,
  rejectIssue,
  getSpecificUser,
  createGenre,
  createUser,
  createMultipleUser,
  loginLibrarian,
  getRenewalRequests,
  approveRenewal,
  rejectRenewal,
  approveOverdueFine,
  approveReturn,
  getLibraryFines,
  revokeFine,
  updateFine,
  approveFinePaymentRequest,
  getRequests,
  requestBooksToAdmin,
};
