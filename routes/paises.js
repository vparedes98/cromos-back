const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", (req, res) => {
  const filas = db.prepare("SELECT * FROM paises").all();
  res.json(filas);
});

router.get("/:id", (req, res) => {
  const fila = db.prepare("SELECT * FROM paises WHERE id = ?").get(req.params.id);
  if (!fila) {
    return res.status(404).json({ error: "No existe un pais con ese id" });
  }
  res.json(fila);
});

router.post("/", (req, res) => {
  const { nombre, continente, codigoFifa, rankingFifa } = req.body;

  if (!nombre || !continente || !codigoFifa) {
    return res.status(400).json({ error: "Faltan campos obligatorios: nombre, continente y codigoFifa" });
  }

  const resultado = db
    .prepare("INSERT INTO paises (nombre, continente, codigoFifa, rankingFifa) VALUES (?, ?, ?, ?)")
    .run(nombre, continente, codigoFifa, rankingFifa ?? null);

  const nuevo = db.prepare("SELECT * FROM paises WHERE id = ?").get(resultado.lastInsertRowid);
  res.status(201).json(nuevo);
});

router.put("/:id", (req, res) => {
  const fila = db.prepare("SELECT * FROM paises WHERE id = ?").get(req.params.id);
  if (!fila) {
    return res.status(404).json({ error: "No existe un pais con ese id" });
  }

  const { nombre, continente, codigoFifa, rankingFifa } = req.body;

  db.prepare("UPDATE paises SET nombre = ?, continente = ?, codigoFifa = ?, rankingFifa = ? WHERE id = ?").run(
    nombre ?? fila.nombre,
    continente ?? fila.continente,
    codigoFifa ?? fila.codigoFifa,
    rankingFifa ?? fila.rankingFifa,
    req.params.id
  );

  const actualizado = db.prepare("SELECT * FROM paises WHERE id = ?").get(req.params.id);
  res.json(actualizado);
});

router.delete("/:id", (req, res) => {
  try {
    const resultado = db.prepare("DELETE FROM paises WHERE id = ?").run(req.params.id);
    if (resultado.changes === 0) {
      return res.status(404).json({ error: "No existe un pais con ese id" });
    }
    res.json({ mensaje: "Pais eliminado", id: Number(req.params.id) });
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
      return res.status(400).json({ error: "No se puede eliminar porque tiene equipos asociados" });
    }
    throw err;
  }
});

module.exports = router;
