import express from "express";

// Controller actions
import {
	modifyUser,
	getAllUsers,
	getSpecificUser,
	createLibrary,
	deleteLibrary,
	updateLibrary,
	createLibrarian,
	createMultipleLibrarians,
	registerAdmin,
	loginAdmin,
} from "../../_controllers/admin/adminController.js";

import { adminProtect } from "../../middlewares/authMiddleware.js";
// Router Setup
const router = express.Router();

router.get("/", (req, res) => {
	res.send("Test API Works Fine");
});

router.post("/modifyUser", adminProtect, modifyUser); 
router.get("/getAllUsers",adminProtect, getAllUsers); //done
router.post("/createLibrary",adminProtect, createLibrary);
router.post("/updateLibrary/:id", adminProtect, updateLibrary); //done
router.delete("/deleteLibrary/:id", adminProtect, deleteLibrary);
router.post("/createLibrarian",adminProtect, createLibrarian);//done
router.post("/createMultipleLibrarians",adminProtect, createMultipleLibrarians);
router.post("/loginAdmin", loginAdmin); //done
router.post("/registerAdmin", registerAdmin);//done


export default router;

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2NTc2NzFlZjgwMWQ2MWY3YWE0YzQ1OCIsImlhdCI6MTcxNzAwNDE2MiwiZXhwIjoxNzE3NjA4OTYyfQ.ldYqf2lNmF0eSHvlBR6PD_VpORWlCr8kn4IFn0tBuwI