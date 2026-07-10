const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", (req, res) => {
  const filas = db.prepare("SELECT * FROM jugadores").all();
  res.json(filas);
});

router.get("/:id", (req, res) => {
  const fila = db.prepare("SELECT * FROM jugadores WHERE id = ?").get(req.params.id);
  if (!fila) {
    return res.status(404).json({ error: "No existe un jugador con ese id" });
  }
  res.json(fila);
});

router.post("/", (req, res) => {
  const { nombre, posicion, numeroCamiseta, fechaNacimiento, equipoId } = req.body;

  if (!nombre || !posicion || !equipoId) {
    return res.status(400).json({ error: "Faltan campos obligatorios: nombre, posicion y equipoId" });
  }

  try {
    const resultado = db
      .prepare(
        "INSERT INTO jugadores (nombre, posicion, numeroCamiseta, fechaNacimiento, equipoId) VALUES (?, ?, ?, ?, ?)"
      )
      .run(nombre, posicion, numeroCamiseta ?? null, fechaNacimiento ?? null, equipoId);

    const nuevo = db.prepare("SELECT * FROM jugadores WHERE id = ?").get(resultado.lastInsertRowid);
    res.status(201).json(nuevo);
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
      return res.status(400).json({ error: "El equipoId no existe" });
    }
    throw err;
  }
});

router.put("/:id", (req, res) => {
  const fila = db.prepare("SELECT * FROM jugadores WHERE id = ?").get(req.params.id);
  if (!fila) {
    return res.status(404).json({ error: "No existe un jugador con ese id" });
  }

  const { nombre, posicion, numeroCamiseta, fechaNacimiento, equipoId } = req.body;

  try {
    db.prepare(
      "UPDATE jugadores SET nombre = ?, posicion = ?, numeroCamiseta = ?, fechaNacimiento = ?, equipoId = ? WHERE id = ?"
    ).run(
      nombre ?? fila.nombre,
      posicion ?? fila.posicion,
      numeroCamiseta ?? fila.numeroCamiseta,
      fechaNacimiento ?? fila.fechaNacimiento,
      equipoId ?? fila.equipoId,
      req.params.id
    );
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
      return res.status(400).json({ error: "El equipoId no existe" });
    }
    throw err;
  }

  const actualizado = db.prepare("SELECT * FROM jugadores WHERE id = ?").get(req.params.id);
  res.json(actualizado);
});

router.delete("/:id", (req, res) => {
  try {
    const resultado = db.prepare("DELETE FROM jugadores WHERE id = ?").run(req.params.id);
    if (resultado.changes === 0) {
      return res.status(404).json({ error: "No existe un jugador con ese id" });
    }
    res.json({ mensaje: "Jugador eliminado", id: Number(req.params.id) });
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
      return res.status(400).json({ error: "No se puede eliminar porque tiene cromos asociados" });
    }
    throw err;
  }
});

module.exports = router;
