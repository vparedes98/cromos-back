require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cromosRouter = require("./routes/cromos");
const paisesRouter = require("./routes/paises");
const equiposRouter = require("./routes/equipos");
const jugadoresRouter = require("./routes/jugadores");
const albumesRouter = require("./routes/albumes");

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
    mensaje: "API de cromos del mundial",
    recursos: ["/api/cromos", "/api/paises", "/api/equipos", "/api/jugadores", "/api/albumes"]
  });
});

app.use("/api/cromos", cromosRouter);
app.use("/api/paises", paisesRouter);
app.use("/api/equipos", equiposRouter);
app.use("/api/jugadores", jugadoresRouter);
app.use("/api/albumes", albumesRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "La imagen no puede pesar mas de 5 MB" });
  }
  if (err.message === "El archivo debe ser una imagen") {
    return res.status(400).json({ error: err.message });
  }

  res.status(500).json({ error: "Error interno del servidor" });
});

app.listen(PUERTO, () => {
  console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});
