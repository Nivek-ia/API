const express = require("express");
const Post = require("../models/Post");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Création du post
router.post("/", authMiddleware, async (req, res) => {
  const { content } = req.body;
  try {
    const newPost = new Post({
      userId: req.user.userId,
      content,
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Mise à jour d’un post
router.put("/:id", authMiddleware, async (req, res) => {
  const postId = req.params.id;
  const { content } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post non trouvé" });

    // Vérifier que l’utilisateur est l’auteur du post
    if (post.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    post.content = content;
    await post.save();
    res.json({ message: "Post mis à jour", post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Suppression d’un post
router.delete("/:id", authMiddleware, async (req, res) => {
  const postId = req.params.id;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post non trouvé" });

    if (post.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    await post.deleteOne();
    res.json({ message: "Post supprimé" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Maj du nombre de likes
router.patch("/:id/like", authMiddleware, async (req, res) => {
  const postId = req.params.id;
  let { increment } = req.body;

  increment = Number(increment);
  if (isNaN(increment) || ![1, -1].includes(increment)) {
    return res.status(400).json({ message: "Increment doit être 1 ou -1" });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post non trouvé" });

    post.likesCount = Math.max(0, post.likesCount + increment);
    await post.save();

    res.json({
      message: "Likes count mis à jour",
      likesCount: post.likesCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Récupérer un post
router.get("/:id", async (req, res) => {
  const postId = req.params.id;
  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post non trouvé" });
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Récupérer tous les posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
