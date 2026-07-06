require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cromosRouter = require("./routes/cromos");

const app = express();
const PUERTO = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.json({
    mensaje: "API de cromos del mundial - Fase 2",
    rutas: ["GET /api/cromos", "GET /api/cromos/:id", "POST /api/cromos", "PUT /api/cromos/:id", "DELETE /api/cromos/:id"]
  });
});

app.use("/api/cromos", cromosRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.listen(PUERTO, () => {
  console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});
