const mongoose = require("mongoose");
require("dotenv").config();

async function dbConnect() {
  const dbUrl = process.env.DB_URL ? process.env.DB_URL.trim() : '';
  console.log("DB_URL:", dbUrl); // Debug log
  mongoose
    .connect(dbUrl)
    .then(() => {
      console.log("Successfully connected to MongoDB Atlas!");
    })
    .catch((error) => {
      console.log("Unable to connect to MongoDB Atlas!");
      console.error(error);
    });
}

module.exports = dbConnect;
