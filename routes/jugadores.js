const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  const [filas] = await db.execute("SELECT * FROM jugadores");
  res.json(filas);
});

router.get("/:id", async (req, res) => {
  const [filas] = await db.execute("SELECT * FROM jugadores WHERE id = ?", [req.params.id]);
  if (filas.length === 0) {
    return res.status(404).json({ error: "No existe un jugador con ese id" });
  }
  res.json(filas[0]);
});

router.post("/", async (req, res) => {
  const { nombre, posicion, numeroCamiseta, fechaNacimiento, equipoId } = req.body;

  if (!nombre || !posicion || !equipoId) {
    return res.status(400).json({ error: "Faltan campos obligatorios: nombre, posicion y equipoId" });
  }

  try {
    const [resultado] = await db.execute(
      "INSERT INTO jugadores (nombre, posicion, numeroCamiseta, fechaNacimiento, equipoId) VALUES (?, ?, ?, ?, ?)",
      [nombre, posicion, numeroCamiseta ?? null, fechaNacimiento ?? null, equipoId]
    );

    const [[nuevo]] = await db.execute("SELECT * FROM jugadores WHERE id = ?", [resultado.insertId]);
    res.status(201).json(nuevo);
  } catch (err) {
    if (err.code === "ER_NO_REFERENCED_ROW_2" || err.code === "ER_NO_REFERENCED_ROW") {
      return res.status(400).json({ error: "El equipoId no existe" });
    }
    throw err;
  }
});

router.put("/:id", async (req, res) => {
  const [filas] = await db.execute("SELECT * FROM jugadores WHERE id = ?", [req.params.id]);
  if (filas.length === 0) {
    return res.status(404).json({ error: "No existe un jugador con ese id" });
  }
  const fila = filas[0];

  const { nombre, posicion, numeroCamiseta, fechaNacimiento, equipoId } = req.body;

  try {
    await db.execute(
      "UPDATE jugadores SET nombre = ?, posicion = ?, numeroCamiseta = ?, fechaNacimiento = ?, equipoId = ? WHERE id = ?",
      [
        nombre ?? fila.nombre,
        posicion ?? fila.posicion,
        numeroCamiseta ?? fila.numeroCamiseta,
        fechaNacimiento ?? fila.fechaNacimiento,
        equipoId ?? fila.equipoId,
        req.params.id
      ]
    );
  } catch (err) {
    if (err.code === "ER_NO_REFERENCED_ROW_2" || err.code === "ER_NO_REFERENCED_ROW") {
      return res.status(400).json({ error: "El equipoId no existe" });
    }
    throw err;
  }

  const [[actualizado]] = await db.execute("SELECT * FROM jugadores WHERE id = ?", [req.params.id]);
  res.json(actualizado);
});

router.delete("/:id", async (req, res) => {
  try {
    const [resultado] = await db.execute("DELETE FROM jugadores WHERE id = ?", [req.params.id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "No existe un jugador con ese id" });
    }
    res.json({ mensaje: "Jugador eliminado", id: Number(req.params.id) });
  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2" || err.code === "ER_ROW_IS_REFERENCED") {
      return res.status(400).json({ error: "No se puede eliminar porque tiene cromos asociados" });
    }
    throw err;
  }
});

module.exports = router;
