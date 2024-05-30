import User from "../../_models/users/user.model.js";
import AsyncErrorHandler from "../../middlewares/AsyncErrorHandler.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const getUser = AsyncErrorHandler(async (req, res) => {
  const id = req.user;

  if (!id) {
    res.status(400).json({ message: "User not found" });
  }
  const user = await User.findById({ _id: mongoose.Types.ObjectId(id) });
  res.json(user);
});

const loginUser = AsyncErrorHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: "All fields are required" });
  }
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400).json({ message: "User not found" });
  }
  if (!(await user.matchPassword(password))) {
    res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.json({ token });
});

const updatePassword = AsyncErrorHandler(async (req, res) => {
  const id = req.user;
  const { oldPassword, newPassword } = req.body;

  if (!id || !oldPassword || !newPassword) {
    res.status(400).json({ message: "All fields are required" });
  }

  const user = await User.findById({_id : id});

  if (!user) {
    res.status(400).json({ message: "User not found" });
  }

  if (!(await user.matchPassword(oldPassword))) {
    res.status(400).json({ message: "Invalid credentials" });
  }

  user.password = newPassword;
  await user.save();
  res.json({ message: "Password updated successfully" });
});

export { getUser, loginUser, updatePassword };
