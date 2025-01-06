const express = require('express');
const { getUsers, addUser, registerVisit } = require('../controllers/usersController');
const router = express.Router();

router.get('/', getUsers);
router.post('/', addUser);
router.post('/visits', registerVisit);

module.exports = router;


