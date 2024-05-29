import express from "express";

// Controller actions
import { modifyUser, getAllUsers, createLibrary, createLibrarian } from "../../_controllers/admin/admin.js";

// Router Setup
const router = express.Router();

router.get("/", (req, res) => {
	res.send("Test API Works Fine");
});

router.post("/modifyUser", modifyUser);
router.get("/getAllUsers", getAllUsers);
router.post("/createLibrary", createLibrary);
router.post("/createLibrarian", createLibrarian);

export default router;
