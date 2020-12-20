const express = require('express');

// gestore dei reindirizzamenti delle richieste POST
const router = express.Router();

/*
    Importazione il file con i metodi utili alle richieste POST
    e instradiamo le chiamate POST ai metodi:
    - CreateUser se facciamo una richiesta di Sign Up
    - LoginUser se facciamo una richiesta di Login
 */

const AuthCtrl = require('../controllers-angular/auth');

router.post('/register', AuthCtrl.CreateUser);
router.post('/login', AuthCtrl.LoginUser);

module.exports = router;
