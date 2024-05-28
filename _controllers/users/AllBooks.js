import mongoose from 'mongoose'
import User from "../../_models/users/user.model";
import Book from "../../_models/Books/book.model";
import Issue from "../../_models/Issue/issue.model";
import AsyncErrorHandler from "../../middlewares/AsyncErrorHandler";

//Book details
const getBookDetails = AsyncErrorHandler(async (req,res)=>{
    const {bookId} = req.params;

    if(!bookId){
        res.status(400);
        return;
    }
    const bookDetails = await bookDetails.findById(bookId);

	if (!bookDetails) {
		res.status(404);
		return;
	}
    res.json(bookDetails);

});

//Update book details
const modifyBookDetails = AsyncErrorHandler(async (req, res) => {
	const { bookId, newDetails } = req.body;

	if (!bookId || !newDetails) {
		res.status(400);
		return;
	}

    const updateBookDetails = await BookDetails.updateOne({_id: new mongoose.Types.ObjectId(bookId)}, {
        $set: newDetails
    })

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
    const { bookId, rating } = req.body;

    if (!bookId || !rating || rating < 1 || rating > 5) {
        res.status(400);
        return;
    }

    const book = await BookDetails.findById(bookId);
    if (!book) {
        res.status(404);
        return;
    }

    // let bookRating = await BookRating.findOne({ book: bookId });
    let bookRatingArray = await BookRatingArray.findOne({ book: bookId });
    if (!bookRatingArray) {
        bookRatingArray = new BookRatingArray({
            book: bookId,
            ratings: [{ userId, rating }]
            // rating: rating,
            // numOfRatings: 1
        });
    } else {
        bookRatingArray.ratings.push({ userId, rating });
        // bookRating.rating = ((bookRating.rating * bookRating.numOfRatings) + rating) / (bookRating.numOfRatings + 1);
        // bookRating.numOfRatings += 1;
    }

    await bookRating.save();

    //average ratings
    const ratings = bookRatingArray.ratings.map(item => item.rating);
    const averageRating = ratings.reduce((acc, curr) => acc + curr, 0) / ratings.length;

    res.json(bookRating);
    
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
        status: "issued"
    });

    await issue.save();

    res.json({ message: "Book successfully issued" });
});


export {
    getBookDetails,
    modifyBookDetails,
    getBooks,
    rateBook,
    issueBookToUser
}
