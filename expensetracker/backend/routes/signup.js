const path = require('path');

const express = require('express');

const router = express.Router();

const userController = require('../controllers/signup');





router.post('/signup' ,userController.signup);

router.post('/login' ,userController.login);






module.exports = router;