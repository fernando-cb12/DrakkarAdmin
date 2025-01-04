const express = require('express');
const db = require('./db/connection');
const usersRoutes = require('./routes/users'); // Importar rutas de usuarios

const app = express();

app.use(express.json());

// Usar las rutas de usuarios
app.use('/api/users', usersRoutes);

app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente.');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
