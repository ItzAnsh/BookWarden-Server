import express from "express";

import {
  createLibrary,
  getAllLibraries,
  getLibrary,
  updateLibrary,
  getLibraryBooks,
  assignLibrarian,
  deleteLibrary,
} from "../../_controllers/library/libraryController.js";
import {protect, libraryProtect, adminProtect } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Test API Works Fine");
}); 

router.get("/getAllLibraries", protect, getAllLibraries);
router.get("/getLibrary/:libraryId",protect, getLibrary);
router.post("/createLibrary",adminProtect, createLibrary);
router.patch("/updateLibrary/:libraryId",adminProtect, updateLibrary);
router.get("/getLibraryBooks/:libraryId",protect, getLibraryBooks);
router.patch("/assignLibrarian",adminProtect, assignLibrarian);
router.delete("/deleteLibrary/:libraryId",adminProtect, deleteLibrary);

export default router   