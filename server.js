require("dotenv").config();
const express = require("express");
const app = express();
const connectDB = require("./config/dbConn");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const corsOptions = require("./config/corsOptions");
const verifyJWT = require("./middleware/verifyJWT");

// Port d'écoute
const PORT = process.env.PORT || 5000;

// Connexion à la base de données MongoDB
connectDB();

// Suppression de l'avertissement de dépréciation de Mongoose
mongoose.set('strictQuery', true);

// Middleware
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// Middleware pour servir les fichiers statiques
app.use("/", express.static(path.join(__dirname, "public")));

// Routes
app.use("/", require("./routes/root"));
app.use("/auth", require("./routes/authRoutes")); // Routes d'authentification
app.use("/users", verifyJWT, require("./routes/userRoutes")); // Routes protégées pour la gestion des utilisateurs
app.use("/doctor", verifyJWT, require("./routes/doctorRoutes")); // Routes protégées pour la gestion des médecins
app.use("/email", verifyJWT, require("./routes/emailRoutes")); // Routes protégées pour l'envoi d'emails

// Gestion des erreurs 404
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

// Démarrer le serveur après la connexion à MongoDB
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

// Gestion des erreurs de connexion MongoDB
mongoose.connection.on("error", (err) => {
  console.log(err);
});
