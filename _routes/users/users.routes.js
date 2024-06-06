import express from "express";
// Ashi's Functions
import {
	getBookDetails,
	getBookDetailsViaIsbn,
	getBooks,
	rateBook,
	issueBookToUser,
	checkAvailability,
} from "../../_controllers/users/AllBooks.js";

// Ashu's Functions
import {
  getUser,
  loginUser,
  updatePassword,
  getUserIssues,
  payFineForLostBook,
  requestFinePaymentForOverdueBook,
  payFineForOverdueBook,
} from "../../_controllers/users/userController.js";

import { protect } from "../../middlewares/authMiddleware.js";

const router = express.Router();

//Ashu's Routes
router.get("/", protect, getUser);
router.post("/login", loginUser);
router.post("/updatePassword", protect, updatePassword);
router.get("/getUserIssues", protect, getUserIssues);
router.post("/checkAvailability", protect, checkAvailability);

//Ashi's Routes
//Get details of single book
router.get("/bookDetails/:id", protect, getBookDetails); //done

//Get details of single book via isbn
router.get("/bookDetailsViaIsbn/:isbn", protect, getBookDetailsViaIsbn); //done
//Get all books
router.get("/getBooks", protect, getBooks); //done

//Rating of single book
router.post("/rateBook/:id", protect, rateBook); //p

//Issue book to user
router.post("/issueBook", protect, issueBookToUser); //done

//Fine for lost book
router.post("/payFineForLostBook", protect, payFineForLostBook);

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2NTgwN2YyN2NiZGFlMzRhZmNhNWE2NiIsImlhdCI6MTcxNzA0ODUwNiwiZXhwIjoxNzE3NjUzMzA2fQ.sneJPD2KxJWY3QTho2lzPoGFZwNTKmhjh_9ZjBcK2ko

//Req for fine payment
router.post("/requestFinePayment", protect, requestFinePaymentForOverdueBook);

//Pay fine after getting approved
router.post("/payFine", protect, payFineForOverdueBook);

export default router;
