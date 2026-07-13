const express = require("express");
const db = require("../db");

const router = express.Router();

function formatear(fila) {
  return {
    ...fila,
    obtenido: fila.obtenido === 1,
    valorMercado: fila.valorMercado === null ? null : Number(fila.valorMercado)
  };
}

router.get("/", async (req, res) => {
  const { edicion, jugadorId, equipoId, paisId } = req.query;

  let sql =
    "SELECT c.* FROM cromos c JOIN jugadores j ON c.jugadorId = j.id JOIN equipos e ON j.equipoId = e.id";
  const condiciones = [];
  const valores = [];

  if (edicion) {
    condiciones.push("c.edicion LIKE ?");
    valores.push("%" + edicion + "%");
  }
  if (jugadorId) {
    condiciones.push("c.jugadorId = ?");
    valores.push(jugadorId);
  }
  if (equipoId) {
    condiciones.push("j.equipoId = ?");
    valores.push(equipoId);
  }
  if (paisId) {
    condiciones.push("e.paisId = ?");
    valores.push(paisId);
  }

  if (condiciones.length > 0) {
    sql += " WHERE " + condiciones.join(" AND ");
  }

  const [filas] = await db.execute(sql, valores);
  res.json(filas.map(formatear));
});

router.get("/:id", async (req, res) => {
  const [filas] = await db.execute("SELECT * FROM cromos WHERE id = ?", [req.params.id]);
  if (filas.length === 0) {
    return res.status(404).json({ error: "No existe un cromo con ese id" });
  }
  res.json(formatear(filas[0]));
});

router.post("/", async (req, res) => {
  const { numeroCromo, edicion, valorMercado, foto, rareza, obtenido, color, jugadorId, albumId } = req.body;

  if (!numeroCromo || !edicion || !rareza || !jugadorId || !albumId) {
    return res.status(400).json({ error: "Faltan campos obligatorios: numeroCromo, edicion, rareza, jugadorId y albumId" });
  }

  try {
    const [resultado] = await db.execute(
      "INSERT INTO cromos (numeroCromo, edicion, valorMercado, foto, rareza, obtenido, color, jugadorId, albumId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [numeroCromo, edicion, valorMercado ?? null, foto ?? null, rareza, obtenido ? 1 : 0, color ?? null, jugadorId, albumId]
    );

    const [[nuevo]] = await db.execute("SELECT * FROM cromos WHERE id = ?", [resultado.insertId]);
    res.status(201).json(formatear(nuevo));
  } catch (err) {
    if (err.code === "ER_NO_REFERENCED_ROW_2" || err.code === "ER_NO_REFERENCED_ROW") {
      return res.status(400).json({ error: "El jugadorId o el albumId no existen" });
    }
    throw err;
  }
});

router.put("/:id", async (req, res) => {
  const [filas] = await db.execute("SELECT * FROM cromos WHERE id = ?", [req.params.id]);
  if (filas.length === 0) {
    return res.status(404).json({ error: "No existe un cromo con ese id" });
  }
  const fila = filas[0];

  const { numeroCromo, edicion, valorMercado, foto, rareza, obtenido, color, jugadorId, albumId } = req.body;

  try {
    await db.execute(
      "UPDATE cromos SET numeroCromo = ?, edicion = ?, valorMercado = ?, foto = ?, rareza = ?, obtenido = ?, color = ?, jugadorId = ?, albumId = ? WHERE id = ?",
      [
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
      ]
    );
  } catch (err) {
    if (err.code === "ER_NO_REFERENCED_ROW_2" || err.code === "ER_NO_REFERENCED_ROW") {
      return res.status(400).json({ error: "El jugadorId o el albumId no existen" });
    }
    throw err;
  }

  const [[actualizado]] = await db.execute("SELECT * FROM cromos WHERE id = ?", [req.params.id]);
  res.json(formatear(actualizado));
});

router.delete("/:id", async (req, res) => {
  const [resultado] = await db.execute("DELETE FROM cromos WHERE id = ?", [req.params.id]);
  if (resultado.affectedRows === 0) {
    return res.status(404).json({ error: "No existe un cromo con ese id" });
  }
  res.json({ mensaje: "Cromo eliminado", id: Number(req.params.id) });
});

module.exports = router;
