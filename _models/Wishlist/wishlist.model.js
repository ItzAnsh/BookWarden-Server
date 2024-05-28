import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const Wishlist = mongoose.model('Wishlist',wishlistSchema);
export default Wishlist

