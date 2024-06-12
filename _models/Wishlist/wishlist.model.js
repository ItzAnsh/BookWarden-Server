import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "users",
		required: true,
	},
	books : [
		{
			type : mongoose.Schema.Types.ObjectId,
			ref : "books"
		}
	]
});

const Wishlist =
	mongoose.models["wishlists"] || mongoose.model("wishlists", wishlistSchema);

export default Wishlist;
