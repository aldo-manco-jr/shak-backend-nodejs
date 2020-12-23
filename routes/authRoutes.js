const express = require('express');

// gestore dei reindirizzamenti delle richieste POST
const router = express.Router();

/*
    Importazione il file con i metodi utili alle richieste POST
    e instradiamo le chiamate POST ai metodi:
    - CreateUser se facciamo una richiesta di Sign Up
    - LoginUser se facciamo una richiesta di Login
 */

const AuthenticationMiddlewares = require('../controllers/auth');
const AuthHelper = require('../helpers/AuthHelper');


// New User Sign Up to SHAK
router.post('/auth/signup', AuthenticationMiddlewares.SignupUser);

// Already Subscribed User Log In to SHAK
router.post('/auth/login', AuthenticationMiddlewares.LoginUser);

// Logged User Changes His Account Password
router.post('/auth/change-password', AuthHelper.VerifyToken, AuthenticationMiddlewares.ChangePassword);

module.exports = router;
