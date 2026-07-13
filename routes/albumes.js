const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  const [filas] = await db.execute("SELECT * FROM albumes");
  res.json(filas);
});

router.get("/:id", async (req, res) => {
  const [filas] = await db.execute("SELECT * FROM albumes WHERE id = ?", [req.params.id]);
  if (filas.length === 0) {
    return res.status(404).json({ error: "No existe un album con ese id" });
  }
  res.json(filas[0]);
});

router.post("/", async (req, res) => {
  const { nombre, anio, cantidadCromos, edicionEspecial } = req.body;

  if (!nombre || !anio) {
    return res.status(400).json({ error: "Faltan campos obligatorios: nombre y anio" });
  }

  const [resultado] = await db.execute(
    "INSERT INTO albumes (nombre, anio, cantidadCromos, edicionEspecial) VALUES (?, ?, ?, ?)",
    [nombre, anio, cantidadCromos ?? null, edicionEspecial ?? null]
  );

  const [[nuevo]] = await db.execute("SELECT * FROM albumes WHERE id = ?", [resultado.insertId]);
  res.status(201).json(nuevo);
});

router.put("/:id", async (req, res) => {
  const [filas] = await db.execute("SELECT * FROM albumes WHERE id = ?", [req.params.id]);
  if (filas.length === 0) {
    return res.status(404).json({ error: "No existe un album con ese id" });
  }
  const fila = filas[0];

  const { nombre, anio, cantidadCromos, edicionEspecial } = req.body;

  await db.execute(
    "UPDATE albumes SET nombre = ?, anio = ?, cantidadCromos = ?, edicionEspecial = ? WHERE id = ?",
    [
      nombre ?? fila.nombre,
      anio ?? fila.anio,
      cantidadCromos ?? fila.cantidadCromos,
      edicionEspecial ?? fila.edicionEspecial,
      req.params.id
    ]
  );

  const [[actualizado]] = await db.execute("SELECT * FROM albumes WHERE id = ?", [req.params.id]);
  res.json(actualizado);
});

router.delete("/:id", async (req, res) => {
  try {
    const [resultado] = await db.execute("DELETE FROM albumes WHERE id = ?", [req.params.id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "No existe un album con ese id" });
    }
    res.json({ mensaje: "Album eliminado", id: Number(req.params.id) });
  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2" || err.code === "ER_ROW_IS_REFERENCED") {
      return res.status(400).json({ error: "No se puede eliminar porque tiene cromos asociados" });
    }
    throw err;
  }
});

module.exports = router;
