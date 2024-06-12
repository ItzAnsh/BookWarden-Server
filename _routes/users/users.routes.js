import express from "express";
// Ashi's Functions
import {
  getBookDetails,
  getBookDetailsViaIsbn,
  getBooks,
  rateBook,
  issueBookToUser,
  checkAvailability,
  requestRenewal,
  reportLost,
  getFines,
  payFine,
} from "../../_controllers/users/AllBooks.js";

// Ashu's Functions
import {
  getUserDetails,
  loginUser,
  updatePassword,
  getUserIssues,
  payFineForLostBook,
  requestFinePaymentForOverdueBook,
  payFineForOverdueBook,
  createPrefrenceList,
  addToPrefrenceList,
  getPrefrenceList,
  removeFromPrefrenceList,
  giveRating,
  getBookRatings,
  likeBook,
  unlikeBook,
  getLikes,
} from "../../_controllers/users/userController.js";

import { protect } from "../../middlewares/authMiddleware.js";

const router = express.Router();

//Ashu's Routes
router.get("/", protect, getUserDetails);
router.post("/login", loginUser);
router.post("/updatePassword", protect, updatePassword);
router.get("/getUserIssues", protect, getUserIssues);
router.post("/checkAvailability", protect, checkAvailability);
router.post("/reportLost", protect, reportLost);
router.post("/createPrefrenceList", protect, createPrefrenceList);
router.post("/addToPrefrenceList", protect, addToPrefrenceList);
router.get("/getPrefrenceList", protect, getPrefrenceList);
router.post("/removeFromPrefrenceList", protect, removeFromPrefrenceList);
router.post("/giveRating", protect, giveRating);
router.get("/getBookRatings/:bookId", protect, getBookRatings);
router.get("/getFines", protect, getFines);
router.post("/payFine", protect, payFine);
router.post("/requestRenewal", protect, requestRenewal);
router.post("/likeBook", protect, likeBook);
router.post("/unlikeBook", protect, unlikeBook);
router.get("/getLikes", protect, getLikes);

//Ashi's Routes
//Get details of single book
router.get("/bookDetails/:id", protect, getBookDetails); 

//Get details of single book via isbn
router.get("/bookDetailsViaIsbn/:isbn", protect, getBookDetailsViaIsbn); //done
//Get all books
router.get("/getBooks", protect, getBooks); 

//Rating of single book
router.post("/rateBook/:id", protect, rateBook); 

//Issue book to user
router.post("/issueBook", protect, issueBookToUser); 

//Fine for lost book
router.post("/payFineForLostBook", protect, payFineForLostBook);

//Req for fine payment
router.post("/requestFinePayment", protect, requestFinePaymentForOverdueBook);

//Pay fine after getting approved
router.post("/payFine", protect, payFineForOverdueBook);

export default router;
