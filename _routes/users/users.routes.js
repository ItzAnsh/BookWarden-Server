import express from "express";
// Ashi's Functions
import {
	createBook,
	getBookDetails,
	modifyBookDetails,
	getBooks,
	rateBook,
	issueBookToUser,
} from "../../_controllers/users/AllBooks.js";

// Ashu's Functions
import {
	getUser,
	loginUser,
	updatePassword,
} from "../../_controllers/users/userController.js";

import { protect } from "../../middlewares/authMiddleware.js";
import Book from "../../_models/Books/book.model.js";

const router = express.Router();

//Ashu's Routes
router.get("/", protect, getUser);
router.post("/login", loginUser);
router.post("/updatePassword", protect, updatePassword);

//Ashi's Routes
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
