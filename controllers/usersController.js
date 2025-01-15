const db = require('../db/connection');
const bcrypt = require('bcrypt');

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
        const diferencia = Math.ceil((fechaPago - fechaActual) / (1000 * 60 * 60 * 24));

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

const getStats = (req, res) => {
    const totalUsersQuery = 'SELECT COUNT(*) AS total FROM usuarios';
    const activeUsersQuery = `
        SELECT COUNT(DISTINCT v.usuario_id) AS active
        FROM visitas v
        WHERE v.fecha_visita >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `;
    const inactiveUsersQuery = `
        SELECT COUNT(*) AS inactive
        FROM usuarios u
        WHERE NOT EXISTS (
            SELECT 1
            FROM visitas v
            WHERE v.usuario_id = u.id AND v.fecha_visita >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        ) OR u.fecha_pago < CURDATE()
    `;

    db.query(totalUsersQuery, (err, totalResult) => {
        if (err) {
            console.error('Error al obtener el total de usuarios:', err);
            return res.status(500).json({ error: 'Error al obtener estadísticas' });
        }

        db.query(activeUsersQuery, (err, activeResult) => {
            if (err) {
                console.error('Error al obtener usuarios activos:', err);
                return res.status(500).json({ error: 'Error al obtener estadísticas' });
            }

            db.query(inactiveUsersQuery, (err, inactiveResult) => {
                if (err) {
                    console.error('Error al obtener usuarios inactivos:', err);
                    return res.status(500).json({ error: 'Error al obtener estadísticas' });
                }

                res.status(200).json({
                    totalUsers: totalResult[0].total,
                    activeUsers: activeResult[0].active,
                    inactiveUsers: inactiveResult[0].inactive,
                });
            });
        });
    });
};

const loginAdmin = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const query = 'SELECT * FROM admin WHERE usuario = ?';
    db.query(query, [username], (err, results) => {
        if (err) {
            console.error('Error al autenticar administrador:', err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const admin = results[0];
        bcrypt.compare(password, admin.contraseña, (err, isMatch) => {
            if (err || !isMatch) {
                return res.status(401).json({ error: 'Credenciales incorrectas' });
            }

            res.status(200).json({ message: 'Inicio de sesión exitoso', token: 'fake-jwt-token' });
        });
    });
};

module.exports = { getUsers, addUser, registerVisit, checkPaymentStatus, getStats, loginAdmin };

