import User from "../../_models/users/user.model.js";
import AsyncErrorHandler from "../../middlewares/AsyncErrorHandler.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Issue from "../../_models/Issue/issue.model.js";
import Book from "../../_models/books/book.model.js";
import { findRole } from "../../lib/findRole.js";
import FinePaymentRequest from "../../_models/FinePaymentRequest/finePayment.model.js";

const getUser = AsyncErrorHandler(async (req, res) => {
	const id = req.user;

	if (!id) {
		res.status(400).json({ message: "User not found" });
	}
	const user = await User.findById({ _id: mongoose.Types.ObjectId(id) });
	res.json(user);
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
	}

	const user = await User.findById({ _id: id });

	if (!user) {
		res.status(400).json({ message: "User not found" });
	}

	if (!(await user.matchPassword(oldPassword))) {
		res.status(400).json({ message: "Invalid credentials" });
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
	}

	const issuedBooks = await Issue.find({ userId: id }).populate("books");
	if (!issuedBooks) {
		res.status(400).json({ message: "Issue not found" });
	}
	res.json(issuedBooks);
});


//FINE FOR LOST BOOK
const payFineForLostBook = async (req, res) => {
	const userId = req.user
    const { bookId } = req.body;

    const book = await Book.findById(bookId);

	if (!book) {
        return res.status(404).send("Book not found!");
    }

    const transaction = new Transaction({
        userId: user._id,
        bookId: book._id,
        amount: Book.price,
        type: 'Lost Book Payment'
    });
    await transaction.save();

    res.json({ message: `Payment successfully processed.` });
};

const requestFinePaymentForOverdueBook = async (req, res) => {
	// const id = req.user;
    const { bookId } = req.body;

    const book = await Book.findById(bookId);

    if (!book) {
        return res.status(404).send("User or book not found!");
    }

    const daysOverdue = calculateDaysOverdue(book.returnDate);
    if (daysOverdue <= 0) {
        return res.status(400).send("Book is not overdue yet!");
    }

    const finePaymentRequest = new FinePaymentRequest({
        userId: user._id,
        bookId: book._id,
        fineAmount: calculateOverdueFine(daysOverdue),
        status: 'Applying'
    });
    await finePaymentRequest.save();

    res.json({ message: `Fine payment request for overdue book submitted successfully.` });
};

const calculateOverdueFine = (daysOverdue) => {
    const fineRatePerDay = 20; 
    return fineRatePerDay * daysOverdue;
};

const calculateDaysOverdue = (returnDate) => {
    const currentDate = new Date();
    const diffInMs = currentDate.getTime() - returnDate.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    return Math.max(0, diffInDays);
};


const payFineForOverdueBook = async (req, res) => {
    const { requestId } = req.body;

    const request = await FinePaymentRequest.findById(requestId);
    if (!request) {
        return res.status(404).send("Fine payment request not found!");
    }

    if (request.status !== 'Approved') {
        return res.status(400).send("Fine payment request has not been approved yet!");
    }

    //payment process---
	
	request.status = 'Completed';
    await request.save();

    res.json({ message: `Fine payment completed successfully.` });
};


export { 
	getUser,
	loginUser, 
	updatePassword, 
	getUserIssues,
	payFineForLostBook,
	requestFinePaymentForOverdueBook,
	payFineForOverdueBook 
};
