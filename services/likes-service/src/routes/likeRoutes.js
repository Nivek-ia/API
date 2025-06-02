const express = require("express");
const axios = require("axios");
const Like = require("../models/Like");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const POSTS_SERVICE_URL = process.env.POSTS_SERVICE_URL;

async function checkPostExists(postId, token) {
  try {
    await axios.get(`${POSTS_SERVICE_URL}/api/posts/${postId}`, {
      headers: { Authorization: token },
    });
    return true;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return false;
    }
    throw error;
  }
}

// Ajouter un like
router.post("/", authMiddleware, async (req, res) => {
  const { postId } = req.body;
  const userId = req.user.userId;
  const token = req.headers.authorization;

  try {
    const postExists = await checkPostExists(postId, token);
    if (!postExists) return res.status(404).json({ message: "Post non trouvé" });

    // D'abord, enregistrer le like dans la base
    const like = new Like({ userId, postId });
    await like.save();
    console.log(`Like créé pour user ${userId} sur post ${postId}`);

    // Puis incrémenter likesCount dans posts-service
    try {
      await axios.patch(
        `${POSTS_SERVICE_URL}/api/posts/${postId}/like`,
        { increment: 1 },
        { headers: { Authorization: token } }
      );
      console.log(`Likes count incrémenté pour post ${postId}`);
    } catch (patchError) {
      // Si la mise à jour échoue, rollback : supprimer le like créé
      await Like.findOneAndDelete({ userId, postId });
      console.error("Erreur mise à jour compteur likes dans post-service:", patchError.message);
      return res.status(500).json({ message: "Erreur lors de la mise à jour du compteur de likes" });
    }

    res.status(201).json({ message: "Like ajouté" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Vous avez déjà aimé ce post" });
    }
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Supprimer un like
router.delete("/", authMiddleware, async (req, res) => {
  const { postId } = req.body;
  const userId = req.user.userId;
  const token = req.headers.authorization;

  try {
    const postExists = await checkPostExists(postId, token);
    if (!postExists) return res.status(404).json({ message: "Post non trouvé" });

    const result = await Like.findOneAndDelete({ userId, postId });
    if (!result) return res.status(404).json({ message: "Like non trouvé" });

    try {
      await axios.patch(
        `${POSTS_SERVICE_URL}/api/posts/${postId}/like`,
        { increment: -1 },
        { headers: { Authorization: token } }
      );
      console.log(`Likes count décrémenté pour post ${postId}`);
    } catch (patchError) {
      console.error("Erreur mise à jour compteur likes dans post-service:", patchError.message);
      return res.status(500).json({ message: "Erreur lors de la mise à jour du compteur de likes" });
    }

    res.json({ message: "Like supprimé" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
