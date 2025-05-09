// Importa la librería Express
const express = require('express');
const cors = require('cors'); // Importa cors
// También necesitaremos sqlite3 más adelante, pero la conexión la haremos en la siguiente fase.
// const sqlite3 = require('sqlite3').verbose();

// Crea una instancia de la aplicación Express
const app = express();

// Define el puerto en el que el servidor escuchará
const PORT = process.env.PORT || 3000; // Usa el puerto 3000 por defecto si no se especifica uno en el entorno

// Middleware para permitir CORS
app.use(cors());

// Middleware para parsear el cuerpo de las solicitudes en formato JSON
app.use(express.json());

// --- Aquí irán la conexión a la base de datos y las definiciones de rutas más adelante ---

// Ruta de ejemplo simple (un endpoint GET a la raíz)
app.get('/', (req, res) => {
  res.send('¡Backend del prototipo funcionando!');
});

// --- Fin de la sección de rutas ---


// Inicia el servidor para que escuche en el puerto especificado
app.listen(PORT, () => {
  console.log(`Servidor bacckend corriendo en http://localhost:${PORT}`);
});