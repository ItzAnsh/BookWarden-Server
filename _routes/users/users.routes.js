import express from "express";
// Ashi's Functions
import {
	getBookDetails,
	modifyBookDetails,
	getBooks,
	rateBook,
	issueBookToUser,
} from "../../_controllers/users/AllBooks";

// Ashu's Functions
import {
	getUser,
	loginUser,
	updatePassword,
} from "../../_controllers/users/userController.js";

import { protect } from "../../middlewares/authMiddleware.js";

const router = express.Router();

//Ashu's Routes
router.get("/", protect, getUser);
router.post("/login", loginUser);
router.post("/updatePassword", protect, updatePassword);

// Ashi's Routes
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
