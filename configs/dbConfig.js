require("dotenv").config();

module.exports = {
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,         // 👈 attention ici
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: parseInt(process.env.MYSQLPORT || "3306"),
};
