const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", (req, res) => {
  const filas = db.prepare("SELECT * FROM equipos").all();
  res.json(filas);
});

router.get("/:id", (req, res) => {
  const fila = db.prepare("SELECT * FROM equipos WHERE id = ?").get(req.params.id);
  if (!fila) {
    return res.status(404).json({ error: "No existe un equipo con ese id" });
  }
  res.json(fila);
});

router.post("/", (req, res) => {
  const { nombre, directorTecnico, anioFundacion, logo, grupoMundialista, paisId } = req.body;

  if (!nombre || !paisId) {
    return res.status(400).json({ error: "Faltan campos obligatorios: nombre y paisId" });
  }

  try {
    const resultado = db
      .prepare(
        "INSERT INTO equipos (nombre, directorTecnico, anioFundacion, logo, grupoMundialista, paisId) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .run(nombre, directorTecnico ?? null, anioFundacion ?? null, logo ?? null, grupoMundialista ?? null, paisId);

    const nuevo = db.prepare("SELECT * FROM equipos WHERE id = ?").get(resultado.lastInsertRowid);
    res.status(201).json(nuevo);
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
      return res.status(400).json({ error: "El paisId no existe" });
    }
    throw err;
  }
});

router.put("/:id", (req, res) => {
  const fila = db.prepare("SELECT * FROM equipos WHERE id = ?").get(req.params.id);
  if (!fila) {
    return res.status(404).json({ error: "No existe un equipo con ese id" });
  }

  const { nombre, directorTecnico, anioFundacion, logo, grupoMundialista, paisId } = req.body;

  try {
    db.prepare(
      "UPDATE equipos SET nombre = ?, directorTecnico = ?, anioFundacion = ?, logo = ?, grupoMundialista = ?, paisId = ? WHERE id = ?"
    ).run(
      nombre ?? fila.nombre,
      directorTecnico ?? fila.directorTecnico,
      anioFundacion ?? fila.anioFundacion,
      logo ?? fila.logo,
      grupoMundialista ?? fila.grupoMundialista,
      paisId ?? fila.paisId,
      req.params.id
    );
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
      return res.status(400).json({ error: "El paisId no existe" });
    }
    throw err;
  }

  const actualizado = db.prepare("SELECT * FROM equipos WHERE id = ?").get(req.params.id);
  res.json(actualizado);
});

router.delete("/:id", (req, res) => {
  try {
    const resultado = db.prepare("DELETE FROM equipos WHERE id = ?").run(req.params.id);
    if (resultado.changes === 0) {
      return res.status(404).json({ error: "No existe un equipo con ese id" });
    }
    res.json({ mensaje: "Equipo eliminado", id: Number(req.params.id) });
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
      return res.status(400).json({ error: "No se puede eliminar porque tiene jugadores asociados" });
    }
    throw err;
  }
});

module.exports = router;
