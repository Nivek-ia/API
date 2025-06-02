# Réseau Social - API Microservices


## Description
Cette application est une API de réseau social construite en architecture **microservices** avec **Node.js**, **Express** et **MongoDB**. Elle permet à des utilisateurs de s’inscrire, se connecter, publier du contenu et liker les publications des autres.

## Microservices

### 1. Auth Service (`auth-service`)
Gère l'inscription, la connexion et la récupération de mot de passe.

- **POST** `/api/auth/register` : Inscription d’un utilisateur.
- **POST** `/api/auth/login` : Connexion d’un utilisateur.
- **POST** `/api/auth/forgot-password` : Générer un token de réinitialisation.
- **POST** `/api/auth/reset-password` : Réinitialiser le mot de passe.

**Sécurité :**
- Mots de passe **hashés avec bcrypt**.
- Authentification par **JWT**.

---

### 2. Post Service (`post-service`)
Permet de publier, modifier, supprimer et consulter des posts.

- **POST** `/api/posts` : Créer un post *(auth requis)*.
- **GET** `/api/posts` : Obtenir tous les posts.
- **GET** `/api/posts/:id` : Obtenir un post spécifique.
- **PUT** `/api/posts/:id` : Modifier un post *(auth + auteur requis)*.
- **DELETE** `/api/posts/:id` : Supprimer un post *(auth + auteur requis)*.
- **PATCH** `/api/posts/:id/like` : Incrémenter/décrémenter le compteur de likes *(auth requis)*.

---

### 3. Like Service (`like-service`)
Permet à un utilisateur d’aimer ou retirer un like d’un post.

- **POST** `/api/likes` : Ajouter un like *(auth requis)*.
- **DELETE** `/api/likes` : Supprimer un like *(auth requis)*.

À chaque action, le compteur de likes est mis à jour dans `post-service`.

---

## Authentification

Toutes les routes protégées nécessitent un **token JWT** dans l'en-tête :

```
Authorization: Bearer <token>
```


## Démarrage

Lancer chaque service dans son dossier respectif :

```bash
cd auth-service && npm start
cd post-service && npm start
cd like-service && npm start
```

---

## Technologies

- Node.js / Express
- MongoDB / Mongoose
- JWT
- Bcrypt
