require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

async function main() {
  const conexion = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true
  });

  await conexion.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
  await conexion.query(`USE \`${process.env.DB_NAME}\``);
  console.log("Base de datos '" + process.env.DB_NAME + "' lista");

  const script = fs.readFileSync(path.join(__dirname, "..", "database.sql"), "utf8");
  await conexion.query(script);
  console.log("Esquema y datos iniciales cargados en " + process.env.DB_HOST);

  await conexion.end();
}

main().catch((err) => {
  console.error("Error al cargar la base de datos:", err.message);
  process.exit(1);
});
