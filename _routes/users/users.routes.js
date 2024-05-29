import express from "express";
import {
	getBookDetails,
	modifyBookDetails,
	getBooks,
	rateBook,
	issueBookToUser
} from "../../_controllers/users/AllBooks" 

const router = express.Router();

//Get details of single book
router.get("/bookDetails/:id", getBookDetails);

//Update book details
router.get("/modifyBookDetails/:id", modifyBookDetails);

//Get all books
router.get("/getBooks", getBooks);

//Rating of single book
router.get("/rateBook", rateBook);

//Issue book to user
router.get("/issueBook/:id", issueBookToUser);

export default router;
