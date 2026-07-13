const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  const [filas] = await db.execute("SELECT * FROM paises");
  res.json(filas);
});

router.get("/:id", async (req, res) => {
  const [filas] = await db.execute("SELECT * FROM paises WHERE id = ?", [req.params.id]);
  if (filas.length === 0) {
    return res.status(404).json({ error: "No existe un pais con ese id" });
  }
  res.json(filas[0]);
});

router.post("/", async (req, res) => {
  const { nombre, continente, codigoFifa, rankingFifa } = req.body;

  if (!nombre || !continente || !codigoFifa) {
    return res.status(400).json({ error: "Faltan campos obligatorios: nombre, continente y codigoFifa" });
  }

  const [resultado] = await db.execute(
    "INSERT INTO paises (nombre, continente, codigoFifa, rankingFifa) VALUES (?, ?, ?, ?)",
    [nombre, continente, codigoFifa, rankingFifa ?? null]
  );

  const [[nuevo]] = await db.execute("SELECT * FROM paises WHERE id = ?", [resultado.insertId]);
  res.status(201).json(nuevo);
});

router.put("/:id", async (req, res) => {
  const [filas] = await db.execute("SELECT * FROM paises WHERE id = ?", [req.params.id]);
  if (filas.length === 0) {
    return res.status(404).json({ error: "No existe un pais con ese id" });
  }
  const fila = filas[0];

  const { nombre, continente, codigoFifa, rankingFifa } = req.body;

  await db.execute(
    "UPDATE paises SET nombre = ?, continente = ?, codigoFifa = ?, rankingFifa = ? WHERE id = ?",
    [
      nombre ?? fila.nombre,
      continente ?? fila.continente,
      codigoFifa ?? fila.codigoFifa,
      rankingFifa ?? fila.rankingFifa,
      req.params.id
    ]
  );

  const [[actualizado]] = await db.execute("SELECT * FROM paises WHERE id = ?", [req.params.id]);
  res.json(actualizado);
});

router.delete("/:id", async (req, res) => {
  try {
    const [resultado] = await db.execute("DELETE FROM paises WHERE id = ?", [req.params.id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "No existe un pais con ese id" });
    }
    res.json({ mensaje: "Pais eliminado", id: Number(req.params.id) });
  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2" || err.code === "ER_ROW_IS_REFERENCED") {
      return res.status(400).json({ error: "No se puede eliminar porque tiene equipos asociados" });
    }
    throw err;
  }
});

module.exports = router;
