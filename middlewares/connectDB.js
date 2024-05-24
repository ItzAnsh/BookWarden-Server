import mongoose from "mongoose";

async function connectDB() {
	if (!mongoose.connections[0].readyState) {
		try {
			const con = await mongoose.connect(process.env.MONGODB_URI);
			console.log(`MongoDB is Connected with Host: ${con.connection.host}`);
			return true;
		} catch (error) {
			console.log("Error connecting to mongo.", error);
			process.exit(1);
		}
	}
}

export default connectDB;
