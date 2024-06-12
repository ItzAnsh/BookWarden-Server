import jwt from "jsonwebtoken";
import User from "../_models/users/user.model.js";
import dotenv from "dotenv";
import AsyncErrorHandler from "./AsyncErrorHandler.js";

dotenv.config();

const protect = AsyncErrorHandler(async (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if (!decoded) {
			res.status(401).json({
				message: "Unauthorized, Token Invalid",
			});
			return;
		}
		const user = await User.findById(decoded.id).select("-password");
		// console.log(user);
		if (!user) {
			res.status(401).json({
				message: "Unauthorized, User not found",
			});
			return;
		}

		req.user = user._id;
		next();
	} else {
		res.status(401).json({
			message: "Unauthorized, No token provided",
		});
	}
});

const librarianProtect = AsyncErrorHandler(async (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if (!decoded) {
			res.status(401).json({
				message: "Unauthorized, Token Invalid",
			});
			return;
		}
		const user = await User.findById(decoded.id).select("-password");
		if (!user) {
			res.status(401).json({
				message: "Unauthorized, User not found",
			});
			return;
		}

		if (user.role !== process.env.LIBRARIAN_KEY) {
			res.status(401).json({
				message: "Unauthorized, Only for librarians",
			});
			return;
		}
		req.user = user._id;
		next();
	} else {
		res.status(401).json({
			message: "Unauthorized, No token provided",
		});
		return;
	}
});
const adminProtect = AsyncErrorHandler(async (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if (!decoded) {
			res.status(401).json({
				message: "Unauthorized, Token Invalid",
			});
			return;
		}
		const user = await User.findById(decoded.id).select("-password");
		if (!user) {
			res.status(401).json({
				message: "Unauthorized, User not found",
			});
			return;
		}

		if (user.role !== process.env.ADMIN_KEY) {
			res.status(401).json({
				message: "Unauthorized, Only for admins",
			});
			return;
		}
		req.user = user._id;
		next();
	} else {
		res.status(401).json({
			message: "Unauthorized, No token provided",
		});
		return;
	}
});

const libraryProtect = AsyncErrorHandler(async (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if (!decoded) {
			res.status(401).json({
				message: "Unauthorized, Token Invalid",
			});
			return;
		}
		const user = await User.findById(decoded.id).select("-password");
		if (!user) {
			res.status(401).json({
				message: "Unauthorized, User not found",
			});
			return;
		}

		if (
			!(
				user.role == process.env.LIBRARY_KEY ||
				user.role == process.env.ADMIN_KEY
			)
		) {
			res.status(401).json({
				message: "Unauthorized, Only for librarians and admins",
			});
			return;
		}
		req.user = user._id;
		next();
	} else {
		res.status(401).json({
			message: "Unauthorized, No token provided",
		});
		return;
	}
});

export { protect, librarianProtect, adminProtect, libraryProtect };
