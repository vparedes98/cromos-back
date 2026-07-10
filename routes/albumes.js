const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", (req, res) => {
  const filas = db.prepare("SELECT * FROM albumes").all();
  res.json(filas);
});

router.get("/:id", (req, res) => {
  const fila = db.prepare("SELECT * FROM albumes WHERE id = ?").get(req.params.id);
  if (!fila) {
    return res.status(404).json({ error: "No existe un album con ese id" });
  }
  res.json(fila);
});

router.post("/", (req, res) => {
  const { nombre, anio, cantidadCromos, edicionEspecial } = req.body;

  if (!nombre || !anio) {
    return res.status(400).json({ error: "Faltan campos obligatorios: nombre y anio" });
  }

  const resultado = db
    .prepare("INSERT INTO albumes (nombre, anio, cantidadCromos, edicionEspecial) VALUES (?, ?, ?, ?)")
    .run(nombre, anio, cantidadCromos ?? null, edicionEspecial ?? null);

  const nuevo = db.prepare("SELECT * FROM albumes WHERE id = ?").get(resultado.lastInsertRowid);
  res.status(201).json(nuevo);
});

router.put("/:id", (req, res) => {
  const fila = db.prepare("SELECT * FROM albumes WHERE id = ?").get(req.params.id);
  if (!fila) {
    return res.status(404).json({ error: "No existe un album con ese id" });
  }

  const { nombre, anio, cantidadCromos, edicionEspecial } = req.body;

  db.prepare("UPDATE albumes SET nombre = ?, anio = ?, cantidadCromos = ?, edicionEspecial = ? WHERE id = ?").run(
    nombre ?? fila.nombre,
    anio ?? fila.anio,
    cantidadCromos ?? fila.cantidadCromos,
    edicionEspecial ?? fila.edicionEspecial,
    req.params.id
  );

  const actualizado = db.prepare("SELECT * FROM albumes WHERE id = ?").get(req.params.id);
  res.json(actualizado);
});

router.delete("/:id", (req, res) => {
  try {
    const resultado = db.prepare("DELETE FROM albumes WHERE id = ?").run(req.params.id);
    if (resultado.changes === 0) {
      return res.status(404).json({ error: "No existe un album con ese id" });
    }
    res.json({ mensaje: "Album eliminado", id: Number(req.params.id) });
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
      return res.status(400).json({ error: "No se puede eliminar porque tiene cromos asociados" });
    }
    throw err;
  }
});

module.exports = router;
