require("dotenv").config();

module.exports = {
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,         // 👈 attention ici
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: parseInt(process.env.MYSQLPORT || "3306"),
};

// Configuration de la connexion à la base de données
// const dbConfig = {
//   port: 3306,
//   host: '127.0.0.1',
//   user: 'root',
//   password: '1234',
//   database: 'transferts',
// };
// module.exports = dbConfig;