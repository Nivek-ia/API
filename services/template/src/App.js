import React, { useState, useEffect } from "react";

const API_USERS = "http://localhost:3001/api/auth";  // Auth service
const API_POSTS = "http://localhost:3002/api/posts"; // Posts service
const API_LIKES = "http://localhost:3003/api/likes"; // Likes service

function App() {
  const [token, setToken] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState("");
  const [forgotUserName, setForgotUserName] = useState("");

  // Nouveaux états pour édition de post
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  // Récupérer les posts
  const fetchPosts = async () => {
    const res = await fetch(API_POSTS);
    const data = await res.json();
    setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Inscription
  const register = async () => {
    const res = await fetch(`${API_USERS}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName, password }),
    });
    const data = await res.json();
    setMessage(data.message);
  };

  // Connexion
  const login = async () => {
    const res = await fetch(`${API_USERS}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName, password }),
    });
    const data = await res.json();
    if (data.token) {
      setToken(data.token);
      setMessage("Connecté !");
    } else {
      setMessage(data.message || "Erreur de connexion");
    }
  };

  // Récupération mot de passe
  const recoverPassword = async () => {
    if (!forgotUserName) {
      setMessage("Veuillez entrer un nom d'utilisateur");
      return;
    }
    const res = await fetch(`${API_USERS}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName: forgotUserName }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(data.message || "Email de récupération envoyé");
    } else {
      setMessage(data.message || "Erreur lors de la récupération du mot de passe");
    }
  };

  // Créer un post
  const createPost = async () => {
    if (!token) {
      setMessage("Connectez-vous d'abord");
      return;
    }
    const res = await fetch(API_POSTS, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Post créé !");
      setContent("");
      fetchPosts();
    } else {
      setMessage(data.message || "Erreur création post");
    }
  };

  // Liker un post
  const likePost = async (postId) => {
    if (!token) {
      setMessage("Connectez-vous pour liker");
      return;
    }
    const res = await fetch(`${API_LIKES}`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ postId }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Like ajouté !");
      fetchPosts();
    } else {
      setMessage(data.message || "Erreur like");
    }
  };

  // Supprimer un post
  const deletePost = async (postId) => {
    if (!token) {
      setMessage("Connectez-vous pour supprimer");
      return;
    }
    const res = await fetch(`${API_POSTS}/${postId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Post supprimé !");
      fetchPosts();
    } else {
      setMessage(data.message || "Erreur suppression");
    }
  };

  // Commencer l'édition d'un post
  const startEditing = (post) => {
    setEditingPostId(post._id);
    setEditingContent(post.content);
    setMessage("");
  };

  // Annuler l'édition
  const cancelEditing = () => {
    setEditingPostId(null);
    setEditingContent("");
    setMessage("");
  };

  // Sauvegarder la modification du post
  const saveEdit = async () => {
    if (!token) {
      setMessage("Connectez-vous pour modifier");
      return;
    }
    if (!editingContent.trim()) {
      setMessage("Le contenu ne peut pas être vide");
      return;
    }

    const res = await fetch(`${API_POSTS}/${editingPostId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: editingContent }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("Post mis à jour !");
      setEditingPostId(null);
      setEditingContent("");
      fetchPosts();
    } else {
      setMessage(data.message || "Erreur mise à jour");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h1>Mini réseau social - Test API</h1>

      {message && (
        <p style={{ marginBottom: 20, color: "green", fontWeight: "bold" }}>
          {message}
        </p>
      )}

      <div style={{ marginBottom: 20 }}>
        <h2>Inscription / Connexion</h2>
        <input 
          placeholder="Nom utilisateur" 
          value={userName} 
          onChange={(e) => setUserName(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Mot de passe" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button onClick={register}>S'inscrire</button>
        <button onClick={login}>Se connecter</button>

        <div style={{ marginTop: 15 }}>
          <h3>Mot de passe oublié ?</h3>
          <input
            placeholder="Nom utilisateur"
            value={forgotUserName}
            onChange={(e) => setForgotUserName(e.target.value)}
          />
          <button onClick={recoverPassword}>Récupérer mon mot de passe</button>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h2>Créer un post</h2>
        <textarea 
          rows={3} 
          placeholder="Contenu du post" 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
        />
        <br />
        <button onClick={createPost}>Publier</button>
      </div>

      <h2>Posts</h2>
      {posts.length === 0 && <p>Aucun post</p>}
      {posts.map(post => (
        <div key={post._id} style={{ border: "1px solid #ccc", marginBottom: 10, padding: 10 }}>
          {editingPostId === post._id ? (
            <>
              <textarea
                rows={3}
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
              />
              <br />
              <button onClick={saveEdit}>Sauvegarder</button>
              <button onClick={cancelEditing} style={{ marginLeft: 10 }}>Annuler</button>
            </>
          ) : (
            <>
              <p>{post.content}</p>
              <p>Likes: {post.likesCount}</p>
              <button onClick={() => likePost(post._id)}>Like 👍</button>
              <button onClick={() => deletePost(post._id)}>Supprimer 🗑️</button>
              <button onClick={() => startEditing(post)} style={{ marginLeft: 10 }}>Modifier ✏️</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default App;
