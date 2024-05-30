import Book from "../../_models/books/book.model.js";
import User from "../../_models/users/user.model.js";
import Genre from "../../_models/books/genre.model.js";
import AsyncErrorHandler from "../../middlewares/AsyncErrorHandler.js";
import generateStrongPassword from "../../lib/generatePassword.js";
import sendWelcomeEmail from "../../lib/nodemailer.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const getAllBooks = AsyncErrorHandler(async (req, res) => {
  const books = await Book.find();
  res.json(books);
});

const getBook = AsyncErrorHandler(async (req, res) => {
  const { bookId } = req.params;
  if (!bookId) {
    res.status(400);
  }

  const book = await Book.findOne({_id: new mongoose.Types.ObjectId(bookId) });
  if (!book) {
    res.status(400);
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
    totalQuantity,
    availableQuantity,
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
    !totalQuantity ||
    !availableQuantity ||
    !publisher ||
    !language ||
    !length ||
    !releaseDate ||
    !imageURL
  ) {
    res.status(400);
  }

  const newBook = new Book({
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
  });
  await newBook.save();
  res.json(newBook);
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
  const { name, email } = req.body;

  if (!name || !email) {
    res.status(400).json({
      message: "All fields are required",
    });
  }

  const password = generateStrongPassword();

  const user = await User.create({ name, email, password });
  if (!user) {
    res.status(400).json({ message: "Failed to create user" });
  }

  sendWelcomeEmail(email, password, name);
  res.json({user, password});

});

const loginLibrarian = AsyncErrorHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: "All fields are required" });
  }
  const user = await User.findOne({ email: email });
  console.log(user)
  if (!user) {
    res.status(400).json({ message: "User not found" });
  }
  if (user.role !== process.env.LIBRARIAN_KEY) {
    res.status(400).json({ message: "Not a librarian" });
  }

  if (!(await user.matchPassword(password))) {
    res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({ token });
});

export {
  getAllBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  getAllUsers,
  getSpecificUser,
  createGenre,
  createUser,
  loginLibrarian,
};
