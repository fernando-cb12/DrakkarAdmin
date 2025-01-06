const express = require('express');
const { getUsers, addUser, registerVisit, checkPaymentStatus } = require('../controllers/usersController');
const router = express.Router();

router.get('/', getUsers);
router.post('/', addUser);
router.post('/visits', registerVisit);
router.post('/payments/check', checkPaymentStatus);

module.exports = router;


