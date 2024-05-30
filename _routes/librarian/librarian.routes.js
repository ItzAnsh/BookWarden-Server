import express from "express";
import mongoose from "mongoose";
import {
  getAllBooks,
  getBook,
  createBook,
  addBookToLibrary,
  updateBook,
  deleteBook,
  getAllUsers,
  getAllIssues,
  approveIssue,
  rejectIssue,
  getSpecificUser,
  createGenre,
  createUser,
  createMultipleUser,
  loginLibrarian,

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
router.patch("/updateBook/:bookId",librarianProtect, updateBook);
router.delete("/deleteBook/:bookId",librarianProtect, deleteBook);
router.get("/getAllUsers",librarianProtect, getAllUsers);
router.get("/getSpecificUser/:userId",librarianProtect, getSpecificUser);
router.get("/getAllIssues",librarianProtect, getAllIssues);
router.patch("/approveIssue",librarianProtect, approveIssue);
router.patch("/rejectIssue",librarianProtect, rejectIssue);
router.post("/createGenre",librarianProtect, createGenre);
router.post("/createUser",librarianProtect, createUser);
router.post("/createMultipleUser",librarianProtect, createMultipleUser);
router.post("/loginLibrarian", loginLibrarian);

export default router;

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2NTgwNzAwYzUwYzUyMjcxNjE0YzgyMSIsImlhdCI6MTcxNzA0NTA1MCwiZXhwIjoxNzE3NjQ5ODUwfQ._6NJPUqcefeOpLx9rgUst-LhYaeQqSpAs1H9CkFuuBY