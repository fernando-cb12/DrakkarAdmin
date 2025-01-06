const db = require('../db/connection');

const getUsers = (req, res) => {
    db.query('SELECT * FROM usuarios', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error al obtener usuarios' });
        } else {
            res.json(results);
        }
    });
};


const addUser = (req, res) => {
    const { nombre, telefono, membresia_id, fecha_pago } = req.body;
    if (!nombre || !telefono || !membresia_id || !fecha_pago) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const query = 'INSERT INTO usuarios (nombre, telefono, membresia_id, fecha_pago) VALUES (?, ?, ?, ?)';
    db.query(query, [nombre, telefono, membresia_id, fecha_pago], (err, result) => {
        if (err) {
            console.error('Error al insertar usuario:', err);
            res.status(500).json({ error: 'Error al registrar usuario' });
        } else {
            res.status(201).json({ message: 'Usuario registrado exitosamente', userId: result.insertId });
        }
    });
};

const registerVisit = (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'Falta el ID del usuario' });
    }

    const today = new Date().toISOString().split('T')[0];

    const checkVisitQuery = 'SELECT * FROM visitas WHERE usuario_id = ? AND fecha_visita = ?';
    db.query(checkVisitQuery, [userId, today], (err, results) => {
        if (err) {
            console.error('Error al verificar visita:', err);
            res.status(500).json({ error: 'Error al verificar visita' });
        } else if (results.length > 0) {
            res.status(200).json({ message: 'La visita de hoy ya está registrada' });
        } else {
            const insertVisitQuery = 'INSERT INTO visitas (usuario_id, fecha_visita) VALUES (?, ?)';
            db.query(insertVisitQuery, [userId, today], (err) => {
                if (err) {
                    console.error('Error al registrar visita:', err);
                    res.status(500).json({ error: 'Error al registrar visita' });
                } else {
                    res.status(201).json({ message: 'Visita registrada exitosamente' });
                }
            });
        }
    });
};

const checkPaymentStatus = (req, res) => {
    const { usuario_id } = req.body;

    if (!usuario_id) {
        return res.status(400).json({ error: 'Falta el ID del usuario' });
    }

    const query = 'SELECT fecha_pago FROM usuarios WHERE id = ?';
    db.query(query, [usuario_id], (err, results) => {
        if (err) {
            console.error('Error al consultar fecha de pago:', err);
            return res.status(500).json({ error: 'Error al verificar estado de pago' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const fechaPago = new Date(results[0].fecha_pago);
        const fechaActual = new Date();
        const diferencia = Math.ceil((fechaPago - fechaActual) / (1000 * 60 * 60 * 24)); // Diferencia en días

        if (diferencia >= 0) {
            res.status(200).json({ 
                message: `Faltan ${diferencia} días para el próximo pago` 
            });
        } else {
            res.status(200).json({ 
                message: `El pago está retrasado por ${Math.abs(diferencia)} días` 
            });
        }
    });
};

module.exports = { getUsers, addUser, registerVisit, checkPaymentStatus };