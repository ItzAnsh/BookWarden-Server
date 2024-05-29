import express from "express";

import {
  getUser,
  loginUser,
  updatePassword,
} from "../../_controllers/users/userController.js";

import { protect } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Users route");
});

router.get("/", protect, getUser);
router.post("/login", loginUser);
router.post("/updatePassword",protect, updatePassword);

export default router;
