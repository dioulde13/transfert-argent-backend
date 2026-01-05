const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const cors = require("cors");
const mysql = require("mysql2/promise"); // ✅ Remplace msnodesqlv8 par mysql2
const sequelize = require("./models/sequelize");
const dbConfig = require("./configs/dbConfig");

// Routes
const utilisateurRoutes = require("./routes/utilisateurRoutes");
const partenaireRoutes = require("./routes/partenaireRoutes");
const deviseRoutes = require("./routes/deviseRoutes");
const entreRoutes = require("./routes/entreRoutes");
const sortieRoutes = require("./routes/sortieRoute");
const rembourserRoutes = require("./routes/rembourserRoutes");
const payementRoutes = require("./routes/payementRoutes");
const authRoutes = require("./routes/authRoute");
const depenseRoute = require("./routes/depenseRoute");
const creditRoute = require("./routes/creditRoute");
const payementCreditRoute = require("./routes/payementCreditRoute");
const echangeRoute = require("./routes/echangeRoute");
const payementEchangeRoute = require("./routes/payementEchangeRoute");
const beneficeRoute = require("./routes/beneficeRoute");
const calculBeneficeRoute = require("./routes/calculBeneficeRoute");
const verifierCaisseRoute = require("./routes/verifierCaisseRoute");
const partenaireOmRoute = require("./routes/partenaireOmRoute");
const payementPartenaireOmRoute = require("./routes/payementPartenaireOmRoute");
const orangeMoneyRoute = require("./routes/orangeMoneyRoute");
const payementOMRoute = require("./routes/payementOMRoute");
const creancierPartenaireRoute = require("./routes/creancierPartenaireRoute");
const exchangeRoute = require("./routes/exchangeRoute");






const app = express();
app.use(bodyParser.json());

app.use(
  cors({
    origin: "*", // Adapter si besoin pour Angular
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);



// ✅ Exemple avec MySQL pour remplacer l'ancienne insertion
app.post("/api/insertProduit", async (req, res) => {
  try {
    const { nomProduit, quantite } = req.body;
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      "CALL insererProduit(?, ?)", // Remplace la procédure SQL Server
      [nomProduit, quantite]
    );
    await connection.end();
    res.status(200).json({ message: "Produit inséré avec succès !" });
  } catch (error) {
    console.error("Erreur lors de l'insertion :", error);
    res.status(500).json({ error: "Erreur lors de l'insertion du produit." });
  }
});

app.get("/check-db-connection", async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.ping();
    await connection.end();
    res.json({ success: true, message: "Connexion à la base de données réussie" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur de connexion", error: error.message });
  }
});

// Initialisation des routes
app.use("/api/utilisateurs", utilisateurRoutes);
app.use("/api/partenaireOm", partenaireOmRoute);
app.use("/api/orangeMoney", orangeMoneyRoute);
app.use("/api/payementOM", payementOMRoute);
app.use("/api/payementPartenaireOm", payementPartenaireOmRoute);
app.use("/api/partenaires", partenaireRoutes);
app.use("/api/verifierCaisse", verifierCaisseRoute);
app.use("/api/devises", deviseRoutes);
app.use("/api/entrees", entreRoutes);
app.use("/api/sorties", sortieRoutes);
app.use("/api/rembourser", rembourserRoutes);
app.use("/api/payement", payementRoutes);
app.use("/api/payementCredit", payementCreditRoute);
app.use("/api/depense", depenseRoute);
app.use("/api/echange", echangeRoute);
app.use("/api/payementEchange", payementEchangeRoute);
app.use("/api/credit", creditRoute);
app.use("/api/benefices", beneficeRoute); 
app.use("/api/calculBenefices", calculBeneficeRoute); 
app.use("/api/auth", authRoutes);
app.use("/api/creancierPartenaire", creancierPartenaireRoute);
app.use("/api/exchange", exchangeRoute);


// Sequelize sync
sequelize
  .sync({ force: true }) // Remettre  force: true si besoin
  .then(() => console.log("Tables créées avec succès"))
  .catch((error) => console.error("Erreur création tables :", error));

// Port Railway ou local
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});

