import express from "express";

// Controller actions
import { modifyUser } from "../../_controllers/admin/admin.js";

// Router Setup
const router = express.Router();

router.get("/", (req, res) => {
	res.send("Test API Works Fine");
});

router.post("/modifyUser", modifyUser);

export default router;
