import Book from "../../_models/books/book.model";
import AsyncErrorHandler from "../../middlewares/AsyncErrorHandler";

const getAllBooks = AsyncErrorHandler(async (req, res) => {
    const books = await Book.find();
    res.json(books);
});

const getBook = AsyncErrorHandler(async (req, res) => {
    const { bookId } = req.params;
    if (!bookId) {
        res.status(400);
    }

    const book = await Book.findById({ _id: mongoose.Types.ObjectId(bookId) });
    if (!book) {
        res.status(400);
    }

    res.json(book);
});

const updateBook = AsyncErrorHandler(async (req, res) => {
    const { bookId } = req.params;
    if (!bookId) {
        res.status(400);
    }
    const { title, author, description, price, genre, totalQuantity, availableQuantity, publisher, language, length, releaseDate, imageURL } = req.body;

    const updateBook = await Book.findByIdAndUpdate(
        { _id: mongoose.Types.ObjectId(bookId) },
        { title, author, description, price, genre, totalQuantity, availableQuantity, publisher, language, length, releaseDate, imageURL }
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

    const deleteBook = await Book.findByIdAndDelete({
        _id: mongoose.Types.ObjectId(bookId),
    });
    if (!deleteBook) {
        res.status(400);
    }

    res.json(deleteBook);
});

export { getAllBooks, getBook, updateBook, deleteBook };