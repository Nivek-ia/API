require("dotenv").config({ path: "../../.env" });
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3001;

console.log("POSTS_SERVICE_URL:", process.env.POSTS_SERVICE_URL);
console.log("LIKES_SERVICE_URL:", process.env.LIKES_SERVICE_URL);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connecté");
    app.listen(PORT, () => console.log(`Auth service démarré sur le port ${PORT}`));
  })
  .catch(err => console.error(err));
