import mongoose from "mongoose";
import AsyncErrorHandler from "../../middlewares/AsyncErrorHandler.js";
import User from "../../_models/users/user.model.js";
import Book from "../../_models/books/book.model.js";

const payForLostBook = async (req, res) => {
    const { userId, bookId } = req.body;

    const user = await User.findById(userId);
    const book = await Book.findById(bookId);

    if (!user || !book) {
        return res.status(404).send("User or book not found!");
    }

    
    const lostBookFine = calculateLostBookFine(book.price);

    const transaction = new Transaction({
        userId: user._id,
        bookId: book._id,
        amount: Book.price,
        type: 'Lost Book Payment'
    });
    await transaction.save();

    res.json({ message: `Payment successfully processed.` });
};
