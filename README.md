# API de Cromos del Mundial

Este repositorio contiene el backend del proyecto de cromos del mundial. Es una API REST hecha con Node.js y Express que expone el CRUD completo de los cromos que en la Fase 1 vivían como data dummy en el frontend ([cromos-front](https://github.com/vparedes98/cromos-front)). Los datos se guardan en MySQL, con el modelo completo de 5 entidades, y las imágenes en S3.

En producción corre sobre una instancia EC2 y se accede a través de CloudFront: https://d2u7pgb2fbwyfw.cloudfront.net/api/cromos

## Cómo levantar la API

```bash
npm install
npm run init-db
npm start
```

La configuración se lee desde el archivo `.env` (hay un `.env.example` de plantilla): puerto del servidor, los datos de conexión a MySQL (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) y el bucket de imágenes (`AWS_REGION`, `S3_BUCKET`).

`npm run init-db` crea la base de datos si no existe y corre `database.sql` para levantar las 5 tablas y cargar los datos iniciales. Solo hace falta correrlo una vez (o cuando se quiera volver al estado inicial). Después, `npm start` deja el servidor corriendo en `http://localhost:3000`.

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
- `foto` guarda la URL de la imagen del cromo en S3. Las imágenes nunca se guardan en el disco del servidor: la base solo conserva la referencia.
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

### Imágenes

| Método | Ruta                   | Qué hace                                      |
| ------ | ---------------------- | --------------------------------------------- |
| POST   | /api/cromos/:id/foto   | Sube la imagen del cromo a S3 y guarda su URL |

Se envía como `multipart/form-data` con el archivo en el campo `foto`. Solo acepta imágenes y hasta 5 MB (si no, responde 400). El archivo va directo a S3 desde memoria, sin pasar por el disco del servidor, y la respuesta trae el cromo ya actualizado con la URL.

## Colección de Postman

En esta misma carpeta está `cromos-api.postman_collection.json`. Se importa en Postman con File > Import y trae una carpeta por recurso con las cinco operaciones del CRUD, más ejemplos de filtros y de errores (404 y llaves foráneas inválidas). La variable `base_url` viene apuntando a la API desplegada en AWS; para probar en local basta cambiarla por `http://localhost:3000`.

## Archivos

- `server.js`: configura Express, el logging de peticiones y monta las rutas.
- `routes/`: un archivo por recurso (cromos, paises, equipos, jugadores, albumes) con su CRUD.
- `db.js`: pool de conexiones a MySQL con `mysql2/promise`.
- `s3.js`: sube las imágenes al bucket de S3.
- `database.sql`: script SQL con las 5 tablas, sus relaciones y los datos iniciales.
- `scripts/init-db.js`: crea la base de datos (si no existe) y ejecuta `database.sql`.
- `.env.example`: plantilla de las variables de entorno.
- `cromos-api.postman_collection.json`: colección para probar la API.

## Despliegue en AWS

La API corre en una instancia **EC2** (Amazon Linux), gestionada con `pm2` para que el proceso se levante solo si el servidor se reinicia. Delante está **CloudFront**, que expone la API por HTTPS bajo la ruta `/api/*` del mismo dominio que sirve el frontend.

Los datos viven en **RDS** (MySQL) y las imágenes en **S3**. Los logs de la aplicación se envían a **CloudWatch** mediante el agente instalado en la instancia.

Sobre las credenciales: el `.env` del servidor solo tiene la conexión a la base y el nombre del bucket. Las credenciales de AWS **no existen en el código ni en el `.env`**: la instancia tiene un rol IAM con permiso para escribir únicamente en el bucket de imágenes, y el SDK las obtiene sola. Los security groups completan el esquema: la base de datos solo acepta conexiones desde la instancia (no desde internet).

## Base de datos: RDS con MySQL

El modelo es claramente relacional (5 tablas unidas por llaves foráneas: un cromo pertenece a un jugador, que pertenece a un equipo, que pertenece a un país), así que la decisión de fondo fue usar una base SQL y no NoSQL. En DynamoDB este mismo modelo obligaría a desnormalizar las 5 entidades o a resolver los filtros combinados (por ejemplo cromos de un país, que cruza jugador → equipo → país) con múltiples consultas manuales; en MySQL es un solo JOIN.

La API corre contra una instancia de Amazon RDS (MySQL), que reemplazó al SQLite local de las primeras entregas. Al sacar los datos del proceso del servidor, el backend queda stateless: se pueden levantar varias instancias de la API sin que cada una tenga datos distintos, porque todas apuntan a la misma base gestionada.
