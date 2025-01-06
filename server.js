const express = require('express');
const db = require('./db/connection');
const usersRoutes = require('./routes/users'); // Importar rutas de usuarios
const morgan = require('morgan');

const app = express();

app.use(express.json());
app.use(morgan('dev'));

// Usar las rutas de usuarios
app.use('/api/users', usersRoutes);

app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente.');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

app.get('/test-db', (req, res) => {
    db.query('SELECT 1 + 1 AS resultado', (err, results) => {
        if (err) {
            res.status(500).send('Error al conectar a la base de datos');
        } else {
            res.send(`Conexión exitosa: ${results[0].resultado}`);
        }
    });
});