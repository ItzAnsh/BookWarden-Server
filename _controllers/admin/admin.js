import mongoose from "mongoose";
import Users from "../../_models/users/user.model.js";
import AsyncErrorHandler from "../../middlewares/AsyncErrorHandler.js";

const getAllUsers = AsyncErrorHandler(async (req, res) => {});

const modifyUser = AsyncErrorHandler(async (req, res) => {
	const { userId, role } = req.body;

	if (!userId || !role) {
		res.status(400);
	}

	if (role !== "librarian" || role !== "user") {
		res.status(400);
	}

	const updateUser = await Users.findOneAndUpdate(
		{ _id: mongoose.Types.ObjectId(userId) },
		{ role: findRole(role) }
	);

	console.log(updateUser);
});

export { modifyUser, getAllUsers };
