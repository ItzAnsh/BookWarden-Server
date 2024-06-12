import express from "express";

// Controller actions
import {
  modifyUser,
  getAllUsers,
  getAllLibraries,
  createLibrary,
  deleteLibrary,
  updateLibrary,
  createLibrarian,
  createMultipleLibrarians,
  registerAdmin,
  loginAdmin,
  getAllRequests,
  approveRequest,
  rejectRequest,
  cancelRequest,
  markRequestAsCompleted,
} from "../../_controllers/admin/adminController.js";

import { adminProtect } from "../../middlewares/authMiddleware.js";
// Router Setup
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Test API Works Fine");
});

router.post("/modifyUser", adminProtect, modifyUser);
router.get("/getAllUsers", adminProtect, getAllUsers);
router.get("/getAllLibraries", adminProtect, getAllLibraries);
router.post("/createLibrary", adminProtect, createLibrary);
router.post("/updateLibrary/:id", adminProtect, updateLibrary); //done
router.delete("/deleteLibrary/:id", adminProtect, deleteLibrary);
router.post("/createLibrarian", adminProtect, createLibrarian); //done
router.post("/createMultipleLibrarians", adminProtect, createMultipleLibrarians);
router.post("/loginAdmin", loginAdmin);
router.post("/registerAdmin", registerAdmin);
router.get("/getAllRequests", adminProtect, getAllRequests);
router.patch("/approveRequest", adminProtect, approveRequest);
router.patch("/rejectRequest", adminProtect, rejectRequest);
router.patch("/cancelRequest", adminProtect, cancelRequest);
router.patch("/markRequestAsCompleted", adminProtect, markRequestAsCompleted);

export default router;
