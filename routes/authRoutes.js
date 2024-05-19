const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Route pour l'enregistrement d'un nouvel utilisateur
router.post("/register", authController.register);

// Route pour la connexion d'un utilisateur
router.post("/login", authController.login);

// Route pour le rafraîchissement du token d'accès
router.get("/refresh", authController.refresh);

// Route pour la déconnexion d'un utilisateur
router.post("/logout", authController.logout);

// Route pour la recherche d'un utilisateur par email ou ID
router.get("/users/:identifier", authController.findUser);

module.exports = router;
