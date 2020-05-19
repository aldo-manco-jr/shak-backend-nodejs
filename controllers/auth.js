const Joi = require('joi');
const HttpStatus = require('http-status-codes');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const users = require('../models/userModels');
const helpers = require('../helpers/helpers');
const dbConfiguration = require('../config/secret');

module.exports = {

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
                        expiresIn: 130
                    });

                    response.cookie('auth', token);

                    response.status(HttpStatus.CREATED).json({message: 'Utente creato con successo!', user, token});

                })
                .catch((error) => {
                    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: 'Errore interno. Riprova più tardi'});
                });
        });
    },

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
                            expiresIn: 10000
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
