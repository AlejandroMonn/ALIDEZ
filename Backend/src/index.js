const app = require('./app');
const connectDB = require('./config/database');
const path = require('path');

// Conectar a la base de datos
connectDB();

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Manejar errores no capturados
process.on('uncaughtException', (err) => {
    console.error('Error no capturado:', err);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('Promesa rechazada no manejada:', err);
    process.exit(1);
}); 