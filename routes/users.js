const express = require('express');
const { getUsers, addUser, registerVisit, checkPaymentStatus, getStats, loginAdmin } = require('../controllers/usersController');
const router = express.Router();

router.get('/', getUsers);
router.post('/', addUser);
router.post('/visits', registerVisit);
router.post('/payments/check', checkPaymentStatus);
router.get('/stats', getStats);
router.post('/admin/login', loginAdmin); 



module.exports = router;


