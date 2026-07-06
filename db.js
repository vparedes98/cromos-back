const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const rutaDb = path.join(__dirname, process.env.DB_FILE || "cromos.db");
const existia = fs.existsSync(rutaDb);

const db = new Database(rutaDb);

db.pragma("foreign_keys = ON");

if (!existia) {
  const script = fs.readFileSync(path.join(__dirname, "database.sql"), "utf8");
  db.exec(script);
  console.log("Base de datos creada desde database.sql");
}

module.exports = db;
