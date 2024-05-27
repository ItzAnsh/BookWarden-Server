import mongoose from 'mongoose'
import User from "../../_models/users/user.model";
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
	const updateBookDetails = await BookDetails.findByIdAndUpdate (
		bookId,
		newDetails,
		{ new: true }
	);
	if (!updateBookDetails) {
		res.status(404);
		return;
	}
	res.json(updateBookDetails);
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

    let bookRating = await BookRating.findOne({ book: bookId });
    if (!bookRating) {
        bookRating = new BookRating({
            book: bookId,
            rating: rating,
            numOfRatings: 1
        });
    } else {
        bookRating.rating = ((bookRating.rating * bookRating.numOfRatings) + rating) / (bookRating.numOfRatings + 1);
        bookRating.numOfRatings += 1;
    }

    await bookRating.save();
    res.json(bookRating);
    
});


export default {getBookDetails,modifyBookDetails,rateBook}
