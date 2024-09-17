// backend/server.js
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql';
import db from './backend/db.js';
import multer from 'multer';
import path from 'path';

const app = express();

// Usa middlewares
app.use(cors());
app.use(bodyParser.json());
app.use('/media', express.static('media'));

// Configuración de la conexión a la base de datos
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Cambia esto si tienes un usuario diferente
  password: '', // Añade tu contraseña aquí si tienes una
  database: 'Sigmmar' // Cambia esto por el nombre de tu base de datos
});

// Configuración de multer para el manejo de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'media/'); // Directorio donde se guardarán las imágenes
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Genera un nombre único para cada archivo
  }
});
const upload = multer({ storage });

// Rutas para la tabla 'área'
app.post('/areas', upload.single('area_img'), (req, res) => {
  const { area_nombre, area_descripcion } = req.body;
  if (!req.file) {
    return res.status(400).json({ error: 'No se ha subido ninguna imagen' });
  }

  const area_directorio_img = `/media/${req.file.filename}`;
  const area_estado = 1;

  const newArea = { area_nombre, area_descripcion, area_directorio_img, area_estado };

  connection.query('INSERT INTO area SET ?', newArea, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al insertar en la base de datos' });
    }
    res.json({ id: results.insertId, ...newArea });
  });
});

// Rutas para la tabla 'sub_área'
app.post('/sub_areas', upload.single('sub_img'), (req, res) => {
  const { area_id, sub_nombre, sub_descripcion } = req.body;
  if (!req.file) {
    return res.status(400).json({ error: 'No se ha subido ninguna imagen' });
  }

  const sub_directorio_img = `/media/${req.file.filename}`;
  const sub_estado = 1;

  const newSubArea = { area_id, sub_nombre, sub_descripcion, sub_directorio_img, sub_estado };

  connection.query('INSERT INTO sub_area SET ?', newSubArea, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al insertar en la base de datos' });
    }
    res.json({ id: results.insertId, ...newSubArea });
  });
});

// Ruta para obtener todas las áreas
app.get('/areas', (req, res) => {
  connection.query('SELECT * FROM area', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});
// Ruta para obtener un área específica
app.get('/areas/:id', (req, res) => {
  const { id } = req.params;
  connection.query('SELECT * FROM area WHERE area_id = ?', [id], (err, results) => {
    if (err) throw err;
    res.json(results[0]); // Retorna el primer resultado
  });
});

// Ruta para actualizar un área específica
app.put('/areas/:id', upload.single('area_img'), (req, res) => {
  const { id } = req.params;
  const { area_nombre, area_descripcion } = req.body;

  // Verificar si se subió una nueva imagen
  let updatedArea;
  if (req.file) {
    const area_directorio_img = `/media/${req.file.filename}`;
    updatedArea = { area_nombre, area_descripcion, area_directorio_img };
  } else {
    updatedArea = { area_nombre, area_descripcion };
  }

  connection.query('UPDATE area SET ? WHERE area_id = ?', [updatedArea, id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al actualizar en la base de datos' });
    }
    res.json(results);
  });
});


// Ruta para eliminar un área específica
app.delete('/areas/:id', (req, res) => {
  const { id } = req.params;
  connection.query('DELETE FROM area WHERE area_id = ?', [id], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Ruta para actualizar el estado de un área específica
app.put('/areas/:id/estado', (req, res) => {
  const { id } = req.params;
  const { area_estado } = req.body;
  connection.query('UPDATE area SET area_estado = ? WHERE area_id = ?', [area_estado, id], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Rutas para la tabla 'login'
app.get('/logins', (req, res) => {
  connection.query('SELECT * FROM login', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.post('/logins', (req, res) => {
  const newLogin = req.body;
  connection.query('INSERT INTO login SET ?', newLogin, (err, results) => {
    if (err) throw err;
    res.json({ id: results.insertId, ...newLogin });
  });
});

app.put('/logins/:id', (req, res) => {
  const { id } = req.params;
  const updatedLogin = req.body;
  connection.query('UPDATE login SET ? WHERE log_id = ?', [updatedLogin, id], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.delete('/logins/:id', (req, res) => {
  const { id } = req.params;
  connection.query('DELETE FROM login WHERE log_id = ?', [id], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Rutas para la tabla 'mensaje'
app.get('/mensajes', (req, res) => {
  connection.query('SELECT * FROM mensaje', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.get('/mensajes/:id', (req, res) => {
  const mensajeId = req.params.id;
  connection.query('SELECT * FROM mensaje WHERE men_id = ?', [mensajeId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error en la consulta' });
    }
    res.json(results);
  });
});

app.post('/mensajes', (req, res) => {
  const newMensaje = req.body;
  connection.query('INSERT INTO mensaje SET ?', newMensaje, (err, results) => {
    if (err) throw err;
    res.json({ id: results.insertId, ...newMensaje });
  });
});

app.put('/mensajes/:id', (req, res) => {
  const { id } = req.params;
  const updatedMensaje = req.body;
  connection.query('UPDATE mensaje SET ? WHERE men_id = ?', [updatedMensaje, id], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.delete('/mensajes/:id', (req, res) => {
  const { id } = req.params;
  connection.query('DELETE FROM mensaje WHERE men_id = ?', [id], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Rutas para la tabla 'sub_área'
app.get('/sub_areas', (req, res) => {
  connection.query('SELECT * FROM sub_area', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});


app.post('/sub_areas', (req, res) => {
  const newSubArea = req.body;
  connection.query('INSERT INTO sub_area SET ?', newSubArea, (err, results) => {
    if (err) throw err;
    res.json({ id: results.insertId, ...newSubArea });
  });
});

// Ruta para actualizar una sub área específica
app.put('/sub_areas/:id', upload.single('sub_img'), (req, res) => {
  const { id } = req.params;
  const { area_id, sub_nombre, sub_descripcion } = req.body;

  // Verificar si se subió una nueva imagen
  let updatedSubArea;
  if (req.file) {
    const sub_directorio_img = `/media/${req.file.filename}`;
    updatedSubArea = { area_id, sub_nombre, sub_descripcion, sub_directorio_img };
  } else {
    updatedSubArea = { area_id, sub_nombre, sub_descripcion };
  }

  connection.query('UPDATE sub_area SET ? WHERE sub_id = ?', [updatedSubArea, id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al actualizar en la base de datos' });
    }
    res.json(results);
  });
});


app.put('/sub_areas/:id/estado', (req, res) => {
  const { id } = req.params;
  const { sub_estado } = req.body;
  connection.query('UPDATE sub_area SET sub_estado = ? WHERE sub_id = ?', [sub_estado, id], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});
app.get('/sub_areas/:id', (req, res) => {
  const { id } = req.params;
  connection.query('SELECT * FROM sub_area WHERE sub_id = ?', [id], (err, results) => {
    if (err) throw err;
    res.json(results[0]); // Retorna el primer resultado
  });
});


app.delete('/sub_areas/:id', (req, res) => {
  const { id } = req.params;
  connection.query('DELETE FROM sub_area WHERE sub_id = ?', [id], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});
// Ruta para actualizar un área específica
app.put('/areas/:id', (req, res) => {
  const { id } = req.params;
  const updatedAreaModifi = req.body;
  connection.query('UPDATE area SET ? WHERE area_id = ?', [updatedAreaModifi, id], (err, results) => {
    if (err) throw err;
    res.json(results);
  });

  // Verificar si se subió una nueva imagen
  let updatedArea;
  if (req.file) {
    const area_directorio_img = `/media/${req.file.filename}`;
    updatedArea = { area_nombre, area_descripcion, area_directorio_img };
  } else {
    updatedArea = { area_nombre, area_descripcion };
  }

  connection.query('UPDATE area SET ? WHERE area_id = ?', [updatedArea, id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al actualizar en la base de datos' });
    }
    res.json(results);
  });
});


// Iniciar el servidor
app.listen(3000, () => {
  console.log('Servidor corriendo en el puerto 3000');
});
