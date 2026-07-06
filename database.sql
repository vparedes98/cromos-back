CREATE TABLE IF NOT EXISTS paises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  continente TEXT NOT NULL,
  codigoFifa TEXT NOT NULL,
  rankingFifa INTEGER
);

CREATE TABLE IF NOT EXISTS equipos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  directorTecnico TEXT,
  anioFundacion INTEGER,
  logo TEXT,
  grupoMundialista TEXT,
  paisId INTEGER NOT NULL,
  FOREIGN KEY (paisId) REFERENCES paises(id)
);

CREATE TABLE IF NOT EXISTS jugadores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  posicion TEXT NOT NULL,
  numeroCamiseta INTEGER,
  fechaNacimiento TEXT,
  equipoId INTEGER NOT NULL,
  FOREIGN KEY (equipoId) REFERENCES equipos(id)
);

CREATE TABLE IF NOT EXISTS albumes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  anio INTEGER NOT NULL,
  cantidadCromos INTEGER,
  edicionEspecial TEXT
);

CREATE TABLE IF NOT EXISTS cromos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numeroCromo TEXT NOT NULL,
  edicion TEXT NOT NULL,
  valorMercado REAL,
  foto TEXT,
  rareza TEXT NOT NULL,
  obtenido INTEGER NOT NULL DEFAULT 0,
  color TEXT,
  jugadorId INTEGER NOT NULL,
  albumId INTEGER NOT NULL,
  FOREIGN KEY (jugadorId) REFERENCES jugadores(id),
  FOREIGN KEY (albumId) REFERENCES albumes(id)
);

INSERT INTO paises (nombre, continente, codigoFifa, rankingFifa) VALUES
  ('Ecuador', 'América', 'ECU', 31),
  ('Argentina', 'América', 'ARG', 1),
  ('Brasil', 'América', 'BRA', 5),
  ('Francia', 'Europa', 'FRA', 2),
  ('España', 'Europa', 'ESP', 8),
  ('Alemania', 'Europa', 'GER', 16),
  ('Japón', 'Asia', 'JPN', 17),
  ('México', 'América', 'MEX', 14);

INSERT INTO equipos (nombre, directorTecnico, anioFundacion, logo, grupoMundialista, paisId) VALUES
  ('La Tri', 'Félix Sánchez', 1925, 'TRI', 'A', 1),
  ('Albiceleste', 'Lionel Scaloni', 1893, 'ARG', 'C', 2),
  ('Canarinha', 'Dorival Júnior', 1914, 'BRA', 'G', 3),
  ('Les Bleus', 'Didier Deschamps', 1919, 'FRA', 'D', 4),
  ('La Roja', 'Luis de la Fuente', 1913, 'ESP', 'E', 5),
  ('Die Mannschaft', 'Julian Nagelsmann', 1900, 'GER', 'F', 6),
  ('Samurai Blue', 'Hajime Moriyasu', 1921, 'JPN', 'B', 7),
  ('El Tri Mexicano', 'Jaime Lozano', 1927, 'MEX', 'H', 8);

INSERT INTO jugadores (nombre, posicion, numeroCamiseta, fechaNacimiento, equipoId) VALUES
  ('Moisés Caicedo', 'Mediocampista', 23, '2001-11-02', 1),
  ('Piero Hincapié', 'Defensa', 3, '2002-01-09', 1),
  ('Lionel Messi', 'Delantero', 10, '1987-06-24', 2),
  ('Julián Álvarez', 'Delantero', 9, '2000-01-31', 2),
  ('Vinícius Júnior', 'Extremo', 7, '2000-07-12', 3),
  ('Rodrygo Goes', 'Delantero', 10, '2001-01-09', 3),
  ('Kylian Mbappé', 'Delantero', 10, '1998-12-20', 4),
  ('Aurélien Tchouaméni', 'Mediocampista', 8, '2000-01-27', 4),
  ('Pedri González', 'Mediocampista', 20, '2002-11-25', 5),
  ('Lamine Yamal', 'Extremo', 19, '2007-07-13', 5),
  ('Jamal Musiala', 'Mediapunta', 10, '2003-02-26', 6),
  ('Florian Wirtz', 'Mediapunta', 17, '2003-05-03', 6),
  ('Takefusa Kubo', 'Extremo', 20, '2001-06-04', 7),
  ('Kaoru Mitoma', 'Extremo', 7, '1997-05-20', 7),
  ('Santiago Giménez', 'Delantero', 11, '2001-04-18', 8),
  ('Edson Álvarez', 'Mediocampista', 4, '1997-10-24', 8);

INSERT INTO albumes (nombre, anio, cantidadCromos, edicionEspecial) VALUES
  ('Cromos del Mundial Cloud Edition', 2026, 24, 'Collector Series');

INSERT INTO cromos (numeroCromo, edicion, valorMercado, foto, rareza, obtenido, color, jugadorId, albumId) VALUES
  ('EC-01', 'Qatar Legacy', 85, NULL, 'edición cloud', 1, '#00c2ff', 1, 1),
  ('EC-02', 'Defensa Elite', 42, NULL, 'especial', 0, '#ffb703', 2, 1),
  ('AR-10', 'Camino a la Gloria', 30, NULL, 'leyenda', 1, '#f94144', 3, 1),
  ('AR-09', 'Futuro Dorado', 90, NULL, 'especial', 1, '#f3722c', 4, 1),
  ('BR-07', 'Samba Spark', 180, NULL, 'edición cloud', 0, '#43aa8b', 5, 1),
  ('BR-11', 'Ataque Total', 110, NULL, 'común', 1, '#90be6d', 6, 1),
  ('FR-10', 'Velocidad Estelar', 190, NULL, 'leyenda', 0, '#577590', 7, 1),
  ('FR-08', 'Motor Central', 100, NULL, 'especial', 1, '#277da1', 8, 1),
  ('ES-20', 'Control Maestro', 95, NULL, 'común', 0, '#8d99ae', 9, 1),
  ('ES-19', 'Nova Talent', 120, NULL, 'edición cloud', 1, '#ef476f', 10, 1),
  ('DE-10', 'Fantasía Alemana', 130, NULL, 'especial', 1, '#ffd166', 11, 1),
  ('DE-17', 'Playmaker Future', 140, NULL, 'edición cloud', 0, '#06d6a0', 12, 1),
  ('JP-20', 'Samurai Skill', 55, NULL, 'común', 1, '#118ab2', 13, 1),
  ('JP-07', 'Wing Pressure', 65, NULL, 'especial', 0, '#073b4c', 14, 1),
  ('MX-11', 'Garra Azteca', 48, NULL, 'común', 0, '#2a9d8f', 15, 1),
  ('MX-04', 'Balance Táctico', 38, NULL, 'común', 1, '#264653', 16, 1),
  ('EC-23', 'Midfield Orbit', 85, NULL, 'especial', 1, '#00a6fb', 1, 1),
  ('AR-30', 'World Icon', 30, NULL, 'leyenda', 0, '#d62828', 3, 1),
  ('BR-20', 'Cloud Dribble', 180, NULL, 'edición cloud', 1, '#52b788', 5, 1),
  ('FR-22', 'Sprint Matrix', 190, NULL, 'leyenda', 1, '#4361ee', 7, 1),
  ('ES-08', 'Rising Star', 120, NULL, 'especial', 0, '#ff006e', 10, 1),
  ('DE-25', 'Engine Room', 130, NULL, 'común', 1, '#6a994e', 11, 1),
  ('JP-11', 'Tokyo Burst', 65, NULL, 'especial', 1, '#3a86ff', 14, 1),
  ('MX-18', 'Cloud Striker', 48, NULL, 'edición cloud', 0, '#e76f51', 15, 1);
