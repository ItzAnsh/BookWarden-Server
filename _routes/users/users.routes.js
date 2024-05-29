import express from "express";
import {
	createBook,
	getBookDetails,
	modifyBookDetails,
	getBooks,
	rateBook,
	issueBookToUser
} from "../../_controllers/users/AllBooks.js" 
import Book from "../../_models/Books/book.model.js";

const router = express.Router();

//Create book
router.post("/createBook", createBook); //done

//Get details of single book
router.get("/bookDetails/:id", getBookDetails); //done

//Update book details
router.post("/modifyBookDetails/:id", modifyBookDetails); //done

//Get all books
router.get("/getBooks", getBooks); //done

//Rating of single book
router.post("/rateBook/:id", rateBook); //p

//Issue book to user
router.post("/issueBook/:id", issueBookToUser); //done

export default router;
