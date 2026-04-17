const mongoose = require("mongoose");

async function connectDb(mongoUri) {
  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(mongoUri);

    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.log("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
}

module.exports = { connectDb };
