import express from "express";
import mongoose from "mongoose";
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

router.get("/getAllBooks", librarianProtect, getAllBooks); //done
router.get("/getBook/:bookId",librarianProtect, getBook); //done
router.post("/createBook",librarianProtect, createBook); //done
router.patch("/updateBook/:bookId",librarianProtect, updateBook); //done
router.delete("/deleteBook/:bookId",librarianProtect, deleteBook); 
router.get("/getAllUsers",librarianProtect, getAllUsers); //done
router.get("/getSpecificUser/:userId",librarianProtect, getSpecificUser); //done
router.post("/createGenre",librarianProtect, createGenre); //done
router.post("/createUser",librarianProtect, createUser); //done
router.post("/loginLibrarian", loginLibrarian); //done

export default router;

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2NTgwNzAwYzUwYzUyMjcxNjE0YzgyMSIsImlhdCI6MTcxNzA0NTA1MCwiZXhwIjoxNzE3NjQ5ODUwfQ._6NJPUqcefeOpLx9rgUst-LhYaeQqSpAs1H9CkFuuBY