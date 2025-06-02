require('dotenv').config({ path: '../../.env' });
require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const likeRoutes = require("./routes/likeRoutes");
app.use("/api/likes", likeRoutes);

console.log("AUTH_SERVICE_URL:", process.env.AUTH_SERVICE_URL);
console.log("POSTS_SERVICE_URL:", process.env.POSTS_SERVICE_URL);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected to likes-service"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Likes Service running on port ${PORT}`);
});
