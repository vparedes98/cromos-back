# API de Cromos del Mundial (Fase 2)

Este repositorio contiene el backend del proyecto de cromos del mundial. Es una API REST hecha con Node.js y Express que expone el CRUD completo de los cromos que en la Fase 1 vivían como data dummy en el frontend ([cromos-front](https://github.com/vparedes98/cromos-front)). Ahora los datos se guardan en una base de datos SQL con el modelo completo de 5 entidades.

## Cómo levantar la API

```bash
npm install
npm start
```

La configuración (puerto y nombre del archivo de base de datos) se lee desde el archivo `.env`. En el repo va `.env.example` como plantilla; basta copiarlo como `.env`. Si no existe, el servidor usa valores por defecto (puerto 3000).

El servidor queda corriendo en `http://localhost:3000`. La primera vez que arranca, todavía no existe el archivo `cromos.db`, así que el script `database.sql` se ejecuta automáticamente para crear las 5 tablas y cargar los datos iniciales. A partir de ahí todos los cambios (altas, ediciones, borrados) quedan guardados aunque se reinicie el servidor. Para volver al estado inicial basta con borrar `cromos.db` y arrancar de nuevo.

Cada petición que llega se registra en consola con su fecha, método y ruta.

## Modelo de datos

Cinco entidades relacionadas:

- **paises**: id, nombre, continente, codigoFifa, rankingFifa
- **equipos**: id, nombre, directorTecnico, anioFundacion, logo, grupoMundialista, paisId → paises
- **jugadores**: id, nombre, posicion, numeroCamiseta, fechaNacimiento, equipoId → equipos
- **albumes**: id, nombre, anio, cantidadCromos, edicionEspecial
- **cromos**: id, numeroCromo, edicion, valorMercado, foto, rareza, obtenido, color, jugadorId → jugadores, albumId → albumes

Notas del modelo:

- `valorMercado` se guarda como número en millones de USD (85 = USD 85M) para poder hacer cálculos; el formateo es cosa del frontend.
- `foto` guarda la URL de la imagen del cromo. Por ahora viene NULL; en la fase cloud apuntará a objetos en S3 (las imágenes no se guardan en el servidor).
- Las llaves foráneas están activadas: no se puede crear un cromo con un `jugadorId` o `albumId` que no existan.

## Endpoints

Hay cinco recursos y todos exponen el mismo CRUD: `/api/cromos`, `/api/paises`, `/api/equipos`, `/api/jugadores` y `/api/albumes`.

| Método | Ruta                  | Qué hace                                      |
| ------ | --------------------- | --------------------------------------------- |
| GET    | /api/{recurso}        | Lista todos los registros                     |
| GET    | /api/{recurso}/:id    | Devuelve un registro por id (404 si no existe) |
| POST   | /api/{recurso}        | Crea un registro (400 si faltan campos o las referencias no existen) |
| PUT    | /api/{recurso}/:id    | Actualiza un registro (los campos que no se envían se conservan) |
| DELETE | /api/{recurso}/:id    | Elimina un registro (400 si otros registros dependen de él) |

### Filtros de cromos

`GET /api/cromos` acepta query params combinables:

- `?edicion=cloud` busca por texto en la edición
- `?jugadorId=3` cromos de un jugador
- `?equipoId=2` cromos de los jugadores de un equipo
- `?paisId=2` cromos de los jugadores del país

Ejemplo de body para el POST de un cromo:

```json
{
  "numeroCromo": "AR-07",
  "edicion": "Nueva Promesa",
  "valorMercado": 70,
  "foto": null,
  "rareza": "especial",
  "obtenido": false,
  "color": "#7fb3d5",
  "jugadorId": 4,
  "albumId": 1
}
```

Los campos obligatorios son `numeroCromo`, `edicion`, `rareza`, `jugadorId` y `albumId`.

## Colección de Postman

En esta misma carpeta está `cromos-api.postman_collection.json`. Se importa en Postman con File > Import y trae una carpeta por recurso con las cinco operaciones del CRUD, más ejemplos de filtros y de errores (404 y llaves foráneas inválidas). Todas usan la variable `base_url` que ya viene configurada con `http://localhost:3000`.

## Archivos

- `server.js`: configura Express, el logging de peticiones y monta las rutas.
- `routes/`: un archivo por recurso (cromos, paises, equipos, jugadores, albumes) con su CRUD.
- `db.js`: abre la conexión a SQLite y ejecuta `database.sql` si la base no existe.
- `database.sql`: script SQL con las 5 tablas, sus relaciones y los datos iniciales.
- `.env.example`: plantilla de las variables de entorno.
- `cromos-api.postman_collection.json`: colección para probar la API.

## Base de datos: hoy y en la fase cloud

El modelo es claramente relacional (5 tablas unidas por llaves foráneas: un cromo pertenece a un jugador, que pertenece a un equipo, que pertenece a un país), así que la decisión de fondo es usar una base SQL y no NoSQL.

Para esta entrega uso SQLite porque permite desarrollar y demostrar el CRUD sin instalar un servidor de base de datos: cualquiera clona el repo y lo corre con `npm install` y `npm start`. Para la fase cloud el plan es migrar a una base gestionada (RDS con MySQL o PostgreSQL): el script `database.sql` y las consultas de las rutas son SQL estándar en su mayoría, de modo que la migración se concentra en `db.js` (la conexión) y no en la lógica de la API. Ese cambio también es necesario para que el backend sea stateless: con la base fuera del servidor, se pueden levantar varias instancias de la API sin que cada una tenga datos distintos.
