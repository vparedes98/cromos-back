const express = require("express");
const db = require("../db");

const router = express.Router();

function formatear(fila) {
  return { ...fila, obtenido: fila.obtenido === 1 };
}

router.get("/", (req, res) => {
  const filas = db.prepare("SELECT * FROM cromos").all();
  res.json(filas.map(formatear));
});

router.get("/:id", (req, res) => {
  const fila = db.prepare("SELECT * FROM cromos WHERE id = ?").get(req.params.id);
  if (!fila) {
    return res.status(404).json({ error: "No existe un cromo con ese id" });
  }
  res.json(formatear(fila));
});

router.post("/", (req, res) => {
  const { numeroCromo, edicion, valorMercado, foto, rareza, obtenido, color, jugadorId, albumId } = req.body;

  if (!numeroCromo || !edicion || !rareza || !jugadorId || !albumId) {
    return res.status(400).json({ error: "Faltan campos obligatorios: numeroCromo, edicion, rareza, jugadorId y albumId" });
  }

  try {
    const resultado = db
      .prepare(
        "INSERT INTO cromos (numeroCromo, edicion, valorMercado, foto, rareza, obtenido, color, jugadorId, albumId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .run(numeroCromo, edicion, valorMercado ?? null, foto ?? null, rareza, obtenido ? 1 : 0, color ?? null, jugadorId, albumId);

    const nuevo = db.prepare("SELECT * FROM cromos WHERE id = ?").get(resultado.lastInsertRowid);
    res.status(201).json(formatear(nuevo));
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
      return res.status(400).json({ error: "El jugadorId o el albumId no existen" });
    }
    throw err;
  }
});

router.put("/:id", (req, res) => {
  const fila = db.prepare("SELECT * FROM cromos WHERE id = ?").get(req.params.id);
  if (!fila) {
    return res.status(404).json({ error: "No existe un cromo con ese id" });
  }

  const { numeroCromo, edicion, valorMercado, foto, rareza, obtenido, color, jugadorId, albumId } = req.body;

  try {
    db.prepare(
      "UPDATE cromos SET numeroCromo = ?, edicion = ?, valorMercado = ?, foto = ?, rareza = ?, obtenido = ?, color = ?, jugadorId = ?, albumId = ? WHERE id = ?"
    ).run(
      numeroCromo ?? fila.numeroCromo,
      edicion ?? fila.edicion,
      valorMercado ?? fila.valorMercado,
      foto ?? fila.foto,
      rareza ?? fila.rareza,
      obtenido === undefined ? fila.obtenido : (obtenido ? 1 : 0),
      color ?? fila.color,
      jugadorId ?? fila.jugadorId,
      albumId ?? fila.albumId,
      req.params.id
    );
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
      return res.status(400).json({ error: "El jugadorId o el albumId no existen" });
    }
    throw err;
  }

  const actualizado = db.prepare("SELECT * FROM cromos WHERE id = ?").get(req.params.id);
  res.json(formatear(actualizado));
});

router.delete("/:id", (req, res) => {
  const resultado = db.prepare("DELETE FROM cromos WHERE id = ?").run(req.params.id);
  if (resultado.changes === 0) {
    return res.status(404).json({ error: "No existe un cromo con ese id" });
  }
  res.json({ mensaje: "Cromo eliminado", id: Number(req.params.id) });
});

module.exports = router;
