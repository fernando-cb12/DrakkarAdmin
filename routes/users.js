const express = require('express');
const router = express.Router();
const db = require('../db/connection'); // Importar conexión a la base de datos

// Ruta para obtener todos los usuarios
router.get('/', (req, res) => {
    db.query('SELECT * FROM usuarios', (err, results) => {
        if (err) {
            console.error('Error al obtener usuarios:', err);
            res.status(500).json({ error: 'Error al obtener usuarios' });
        } else {
            res.json(results);
        }
    });
});

module.exports = router;
