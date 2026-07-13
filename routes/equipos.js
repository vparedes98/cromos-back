const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  const [filas] = await db.execute("SELECT * FROM equipos");
  res.json(filas);
});

router.get("/:id", async (req, res) => {
  const [filas] = await db.execute("SELECT * FROM equipos WHERE id = ?", [req.params.id]);
  if (filas.length === 0) {
    return res.status(404).json({ error: "No existe un equipo con ese id" });
  }
  res.json(filas[0]);
});

router.post("/", async (req, res) => {
  const { nombre, directorTecnico, anioFundacion, logo, grupoMundialista, paisId } = req.body;

  if (!nombre || !paisId) {
    return res.status(400).json({ error: "Faltan campos obligatorios: nombre y paisId" });
  }

  try {
    const [resultado] = await db.execute(
      "INSERT INTO equipos (nombre, directorTecnico, anioFundacion, logo, grupoMundialista, paisId) VALUES (?, ?, ?, ?, ?, ?)",
      [nombre, directorTecnico ?? null, anioFundacion ?? null, logo ?? null, grupoMundialista ?? null, paisId]
    );

    const [[nuevo]] = await db.execute("SELECT * FROM equipos WHERE id = ?", [resultado.insertId]);
    res.status(201).json(nuevo);
  } catch (err) {
    if (err.code === "ER_NO_REFERENCED_ROW_2" || err.code === "ER_NO_REFERENCED_ROW") {
      return res.status(400).json({ error: "El paisId no existe" });
    }
    throw err;
  }
});

router.put("/:id", async (req, res) => {
  const [filas] = await db.execute("SELECT * FROM equipos WHERE id = ?", [req.params.id]);
  if (filas.length === 0) {
    return res.status(404).json({ error: "No existe un equipo con ese id" });
  }
  const fila = filas[0];

  const { nombre, directorTecnico, anioFundacion, logo, grupoMundialista, paisId } = req.body;

  try {
    await db.execute(
      "UPDATE equipos SET nombre = ?, directorTecnico = ?, anioFundacion = ?, logo = ?, grupoMundialista = ?, paisId = ? WHERE id = ?",
      [
        nombre ?? fila.nombre,
        directorTecnico ?? fila.directorTecnico,
        anioFundacion ?? fila.anioFundacion,
        logo ?? fila.logo,
        grupoMundialista ?? fila.grupoMundialista,
        paisId ?? fila.paisId,
        req.params.id
      ]
    );
  } catch (err) {
    if (err.code === "ER_NO_REFERENCED_ROW_2" || err.code === "ER_NO_REFERENCED_ROW") {
      return res.status(400).json({ error: "El paisId no existe" });
    }
    throw err;
  }

  const [[actualizado]] = await db.execute("SELECT * FROM equipos WHERE id = ?", [req.params.id]);
  res.json(actualizado);
});

router.delete("/:id", async (req, res) => {
  try {
    const [resultado] = await db.execute("DELETE FROM equipos WHERE id = ?", [req.params.id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "No existe un equipo con ese id" });
    }
    res.json({ mensaje: "Equipo eliminado", id: Number(req.params.id) });
  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2" || err.code === "ER_ROW_IS_REFERENCED") {
      return res.status(400).json({ error: "No se puede eliminar porque tiene jugadores asociados" });
    }
    throw err;
  }
});

module.exports = router;
