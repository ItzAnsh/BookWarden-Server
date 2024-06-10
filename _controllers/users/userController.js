import User from "../../_models/users/user.model.js";
import AsyncErrorHandler from "../../middlewares/AsyncErrorHandler.js";
import jwt from "jsonwebtoken";
import Issue from "../../_models/Issue/issue.model.js";
import Book from "../../_models/books/book.model.js";
import Fine from "../../_models/fine/fine.model.js";
import Prefrence from "../../_models/prefrences/prefrence.model.js";
import Genre from "../../_models/books/genre.model.js";

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

  const issuedBooks = await Issue.find({ userId: id }).populate("books");
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
};
