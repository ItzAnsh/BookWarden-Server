import express from "express";

import {
  getAllBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  getAllUsers,
  getSpecificUser,
  createGenre,
  createUser,
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
router.patch("/updateBook/:bookId",librarianProtect, updateBook);
router.delete("/deleteBook/:bookId",librarianProtect, deleteBook);
router.get("/getAllUsers",librarianProtect, getAllUsers);
router.get("/getSpecificUser/:userId",librarianProtect, getSpecificUser);
router.post("/createGenre",librarianProtect, createGenre);
router.post("/createUser",librarianProtect, createUser);
router.post("/loginLibrarian", loginLibrarian);

export default router;