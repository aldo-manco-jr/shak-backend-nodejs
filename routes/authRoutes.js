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

// New User Sign Up to SHAK with Face Recognition
router.post('/auth/signup/face-authentication', AuthenticationMiddlewares.SignupUserFaceRecognition);

// Already Subscribed User Log In to SHAK through Face Recognition
router.post('/auth/login/face-authentication', AuthenticationMiddlewares.LoginUserFaceRecognition);

// Already Subscribed User Deletes His Account from SHAK
router.delete('/auth/delete', AuthHelper.VerifyToken, AuthenticationMiddlewares.DeleteUser);

// Logged User Changes His Account Password
router.post('/auth/change-password', AuthHelper.VerifyToken, AuthenticationMiddlewares.ChangePassword);


module.exports = router;
