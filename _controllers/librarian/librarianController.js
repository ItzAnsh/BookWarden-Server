import Book from "../../_models/books/book.model.js";
import User from "../../_models/users/user.model.js";
import Genre from "../../_models/books/genre.model.js";
import AsyncErrorHandler from "../../middlewares/AsyncErrorHandler.js";
import generateStrongPassword from "../../lib/generatePassword.js";
import {
  sendWelcomeEmail,
  sendIssueStatusEmail,
} from "../../lib/nodemailer.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Issue from "../../_models/Issue/issue.model.js";
import Library from "../../_models/Library/library.model.js";
import Location from "../../_models/locations/locations.model.js";

const getAllBooks = AsyncErrorHandler(async (req, res) => {
  const books = await Book.find();
  res.json(books);
});

const getBook = AsyncErrorHandler(async (req, res) => {
  const { bookId } = req.params;
  if (!bookId) {
    res.status(400);
  }

  const book = await Book.findOne({ _id: new mongoose.Types.ObjectId(bookId) });
  if (!book) {
    res.status(400);
  }

  res.json(book);
});

const createBook = AsyncErrorHandler(async (req, res) => {
  console.log(req.headers);
  console.log(req.body);
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
    !imageURL
  ) {
    res.status(400).json("Please enter all the book details!");
    return;
  }
  console.log("Book Data Found");
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
  });
  console.log("Book instance created");
  console.log(newBook);
  await newBook.save();
  console.log("Book instance saved");
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
  const { bookId, libraryId, totalQuantity, availableQuantity } = req.body;
  if (!bookId) {
    res.status(400);
  }
  const book = await Book.findById(bookId);
  if (!book) {
    res.status(400);
  }

  const newLocation = new Location({
    libraryId: libraryId,
    bookId: bookId,
    totalQuantity,
    availableQuantity,
  });
  await newLocation.save();

  const library = await Library.findById(libraryId);
  library.totalBooks += totalQuantity;
  await library.save();

  res.json(newLocation);
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
  } = req.body;

  const updateBook = await Book.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(bookId) },
    {
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
    }
  );

  if (!updateBook) {
    res.status(400);
  }

  res.json(updateBook);
});

const deleteBook = AsyncErrorHandler(async (req, res) => {
  const { bookId } = req.params;
  if (!bookId) {
    res.status(400);
  }

  const deleteBook = await Book.findOneAndDelete({
    _id: new mongoose.Types.ObjectId(bookId),
  });
  if (!deleteBook) {
    res.status(400);
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
    res.status(400);
  }

  const user = await User.findOne({ _id: new mongoose.Types.ObjectId(userId) });
  if (!user) {
    res.status(400).json({ message: "User not found" });
  }
  res.json(user);
});

const createGenre = AsyncErrorHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    res.status(400).json({ message: "All fields are required" });
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
  }

  const librarian = await User.findById(id);
  if (!librarian) {
    res.status(400).json({ message: "Librarian not found" });
  }

  if (librarian.role !== process.env.LIBRARIAN_KEY) {
    res.status(400).json({ message: "Not a librarian" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400).json({ message: "User already exists" });
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
  }

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

    createdUsers.push(newUser);
    emailContent.push({ email, password, name });
  }
  await User.insertMany(createdUsers);

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
  const issues = await Issue.find().populate("books").populate({
    path: "userId",
    select: "-password",
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

  const library = await Library.findOne({librarian : librarian._id});
  if (!library) {
    res.status(400).json({ message: "Library not found" });
    return;
  }

  const issues = await Issue.find({libraryId: library._id}).populate("books").populate("userId");
  issues.sort((a, b) => b.date - a.date);
  res.json(issues);
})

const approveIssue = AsyncErrorHandler(async (req, res) => {
  const { issueId } = req.body;

  if (!issueId) {
    res.status(400);
    return;
  }

  const issue = await Issue.findById(issueId)
    .populate("books")
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
  issue.status = "issued";
  await issue.save();
  sendIssueStatusEmail(issue.userId.email, issue);
  res.json(issue);
});

const rejectIssue = AsyncErrorHandler(async (req, res) => {
  const { issueId } = req.body;

  if (!issueId) {
    res.status(400);
    return;
  }

  const issue = await Issue.findById(issueId);
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
    res.status(400);
    return;
  }

  const issue = await Issue.findById(issueId);
  if (!issue) {
    res.status(400).json({ message: "Issue not found" });
    return;
  }
  res.json(issue);
});


const approveFinePaymentRequest = async (req, res) => {
  const { requestId } = req.body;

  const request = await FinePaymentRequest.findById(requestId);
  if (!request) {
      return res.status(404).send("Fine payment request not found!");
  }

  if (request.status === 'Approved' || request.status === 'Completed') {
      return res.status(400).send("Fine payment request has already been approved or completed!");
  }

  request.status = 'Approved';
  await request.save();

  res.json({ message: `Fine payment request approved successfully.` });
};

export {
  getAllBooks,
  getBook,
  createBook,
  addBookToLibrary,
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
  approveFinePaymentRequest
};
