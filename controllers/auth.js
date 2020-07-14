/*
    (joi)
      Package che offre metodi per controllare l'integrità dei dati passati dall'utente nel form

   (http-status-codes)
      Enumerazione contenente tutti i possibili HTTP Status Code

   (bcryptjs)
      Package utile per crittografare la password dell'utente

   (jwt)
      Package con strumenti utili alla creazione di Json Web Token (JWT)
      I token sono utili per verificare il diritto degli utenti ad accedere alle varie zone del sito
 */

const Joi = require('joi');
const HttpStatus = require('http-status-codes');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// importazione schema utente
const users = require('../models/userModels');
const helpers = require('../helpers/helpers');
const dbConfiguration = require('../config/secret');

module.exports = {

    /*
        (CreateUser) => metodo per l'inserimento del nuovo utente nel database
            1. Definizione Vincoli Schema Utente
            2. Verifica che i dati rispettino i vincoli
            3. Controlla che Email, Username ricevuti, non siano già registrati nel database
            4. Crittografa la Password
            5. Creazione Documento JSON MongoDB
            6. Inserimento Documento nel database
            7. Creazione di un Token composto da:
               - Header -> contiene i permessi dell'utente
               - Payload -> contiene i dati dell'utente
               - Signature
            8. Inserimento Token nel Cookie dell'utente con scadenza
     */

    async CreateUser(request, response) {

        const schema = Joi.object().keys({
            username: Joi.string().min(4).max(16).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(8).max(64).required()
            // .regex(/^[a-zA-Z0-9]{3,30}$/)
        });

        const {error, value} = Joi.validate(request.body, schema);

        if (error && error.details) {
            return response.status(HttpStatus.BAD_REQUEST).json({validationErrorMessage: error.details});
        }

        const userEmail = await users.findOne({email: helpers.lowerCase(request.body.email)});

        if (userEmail) {
            return response.status(HttpStatus.CONFLICT).json({message: 'Email già registrata'});
        }

        const username = await users.findOne({username: helpers.firstLetterUppercase(request.body.username)});

        if (username) {
            return response.status(HttpStatus.CONFLICT).json({message: 'Nome utente già esistente'});
        }

        return bcrypt.hash(value.password, 16, (error, hashedPassword) => {

            if (error) {
                response.status(HttpStatus.BAD_REQUEST).json({message: 'Errore nella codifica della password'});
            }

            const newUser = {
                username: helpers.firstLetterUppercase(value.username),
                email: helpers.lowerCase(value.email),
                password: hashedPassword
            };

            users.create(newUser)
                .then((user) => {

                    const token = jwt.sign({data: user}, dbConfiguration.secret, {
                        expiresIn: "1h"
                    });

                    response.cookie('auth', token);

                    response.status(HttpStatus.CREATED).json({message: 'Utente creato con successo!', user, token});

                })
                .catch((error) => {
                    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: 'Errore interno. Riprova più tardi'});
                });
        });
    },

    /*
        (LoginUser) -> metodo per la verifica dell'esistenza e della correttezza dei dati inseriti per accedere
            1. Verifica l'esistenza dell'username nel database
            2. Se esiste, controllo che la password sia corretta
            3. Se è corretta, creo un token con i dati dell'utente
            4. Inserisco il Token nel Cookie
     */

    async LoginUser(request, response){

        if (!request.body.username || !request.body.password){
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: 'Non sono ammessi campi vuoti.'});
        }

        await users.findOne({username: helpers.firstLetterUppercase(request.body.username)})
            .then((userFound) => {

                if (!userFound){
                    response.status(HttpStatus.NOT_FOUND).json({message: 'Utente non registrato.'});
                }

                return bcrypt.compare(request.body.password, userFound.password)
                    .then((isPasswordCorrect) => {

                        if (!isPasswordCorrect){
                            response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: 'Password non corretta.'});
                        }

                        const token = jwt.sign({data: userFound}, dbConfiguration.secret, {
                            expiresIn: "1h"
                        });

                        response.cookie(token);

                        return response.status(HttpStatus.OK).json({message: 'Login effettuato con successo :)', userFound, token});
                    });
            })
            .catch((error) => {
                return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: 'Si è verificato un errore, riprovare più tardi.'});
            });
    }
};
