const express = require("express");
const router = express.Router();
const path = require("path");

// Route pour la page d'accueil
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "index.html"));
});

// Route pour la page de login
router.get("/auth/login", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "login.html"));
});

// Route pour la page d'inscription
router.get("/auth/register", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "register.html"));
});

// Route pour logout
router.get("/logout", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "index.html"));
});

// Route pour doctor
router.get("/doctor.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "doctor.html"));
});

// Route pour patient
router.get("/patient.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "patient.html"));
});

module.exports = router;
