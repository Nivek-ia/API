require("dotenv").config({ path: "../../.env" });
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const postRoutes = require("./routes/postRoutes");
app.use("/api/posts", postRoutes);

console.log("AUTH_SERVICE_URL:", process.env.AUTH_SERVICE_URL);
console.log("LIKES_SERVICE_URL:", process.env.LIKES_SERVICE_URL);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected to posts-service"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Posts Service running on port ${PORT}`);
});
