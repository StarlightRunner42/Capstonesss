require("dotenv").config(); // Load environment variables
const mongoose = require("mongoose");

const connection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected Successfully!");
    } catch (err) {
        console.error("MongoDB Connection Failed:", err.message);
        process.exit(1); // Exit process on failure
    }
};

module.exports = connection;
