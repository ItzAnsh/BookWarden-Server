import mongoose from "mongoose";

const genreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

const Genre = mongoose.model("genres", genreSchema);

export default Genre;