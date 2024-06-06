import express from "express";
import mongoose from "mongoose";
import {
  getAllBooks,
  getBook,
  createBook,
  addBookToLibrary,
  addBookToLibraryViaIsbn,
  updateBook,
  deleteBook,
  getAllUsers,
  getAllIssues,
  getLibraryIssues,
  approveIssue,
  rejectIssue,
  getSpecificUser,
  createGenre,
  createUser,
  createMultipleUser,
  loginLibrarian,
  getRenewalRequests,
  approveRenewal,
  rejectRenewal,
  approveOverdueFine,
  approveReturn,
  getLibraryFines,
  revokeFine,
  updateFine,
  approveFinePaymentRequest
} from "../../_controllers/librarian/librarianController.js";

import { librarianProtect } from "../../middlewares/authMiddleware.js";

// Router Setup
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Test API Works Fine");
});

router.get("/getAllBooks", librarianProtect, getAllBooks);
router.get("/getBook/:bookId",librarianProtect, getBook);
router.post("/createBook",librarianProtect, createBook);
router.post("/addBookToLibrary",librarianProtect, addBookToLibrary);
router.post("/addBookToLibraryViaIsbn",librarianProtect, addBookToLibraryViaIsbn);
router.patch("/updateBook/:bookId",librarianProtect, updateBook);
router.delete("/deleteBook/:bookId",librarianProtect, deleteBook);
router.get("/getAllUsers",librarianProtect, getAllUsers);
router.get("/getSpecificUser/:userId",librarianProtect, getSpecificUser);
router.get("/getAllIssues",librarianProtect, getAllIssues);
router.get("/getLibraryIssues",librarianProtect, getLibraryIssues);
router.patch("/approveIssue",librarianProtect, approveIssue);
router.patch("/rejectIssue",librarianProtect, rejectIssue);
router.post("/createGenre",librarianProtect, createGenre);
router.post("/createUser",librarianProtect, createUser);
router.post("/createMultipleUser",librarianProtect, createMultipleUser);
router.post("/loginLibrarian", loginLibrarian);
router.get("/getRenewalRequests",librarianProtect, getRenewalRequests);
router.patch("/approveRenewal",librarianProtect, approveRenewal);
router.patch("/rejectRenewal",librarianProtect, rejectRenewal);
router.patch("/approveOverdueFine",librarianProtect, approveOverdueFine);
router.patch("/approveReturn",librarianProtect, approveReturn);
router.get("/getLibraryFines",librarianProtect, getLibraryFines);
router.patch("/revokeFine",librarianProtect, revokeFine);
router.patch("/updateFine",librarianProtect, updateFine);
router.post("/approveFinePaymentRequest", librarianProtect, approveFinePaymentRequest);

export default router;
