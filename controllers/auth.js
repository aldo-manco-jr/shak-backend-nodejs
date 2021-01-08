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
const posts = require('../models/postModels');
const helpers = require('../helpers/helpers');
const dbConfiguration = require('../config/secret');

// cloudinary image cloud service import and setting
const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: 'dfn8llckr',
  api_key: '575675419138435',
  api_secret: 'lE_zxe8vYudPLseXYFAJojyyTpc'
});

// library to execute python script in nodejs
const spawn = require('child_process').spawn;
const { exec } = require('child_process');

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

  async SignupUser(request, response) {

    const schema = Joi.object().keys({
      username: Joi.string().min(4).max(16).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).max(64).required()
      // .regex(/^[a-zA-Z0-9]{3,30}$/)
    });

    const { error, value } = Joi.validate(request.body, schema);

    if (error && error.details) {
      return response.status(HttpStatus.BAD_REQUEST).json({ validationErrorMessage: error.details });
    }

    const userEmail = await users.findOne({ email: helpers.lowerCase(request.body.email) });

    if (userEmail) {
      return response.status(HttpStatus.CONFLICT).json({ message: 'Email già registrata' });
    }

    const username = await users.findOne({ username: helpers.firstLetterUppercase(request.body.username) });

    if (username) {
      return response.status(HttpStatus.FORBIDDEN).json({ message: 'Nome utente già esistente' });
    }

    return bcrypt.hash(value.password, 10, (error, hashedPassword) => {

      if (error) {
        response.status(HttpStatus.BAD_REQUEST).json({ message: 'Errore nella codifica della password' });
      }

      const newUser = {
        username: helpers.firstLetterUppercase(value.username),
        email: helpers.lowerCase(value.email),
        password: hashedPassword
      };

      users.create(newUser)
        .then((user) => {

          // token (jwt) => header.payload.signature
          const token = jwt.sign({ data: user }, dbConfiguration.secret, {
            expiresIn: '8h'
          });

          response.cookie('auth', token);

          response.status(HttpStatus.CREATED).json({ message: 'Utente creato con successo!', user, token });

        })
        .catch((error) => {
          response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Errore interno. Riprova più tardi' });
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

  async LoginUser(request, response) {

    if (!request.body.username || !request.body.password) {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Non sono ammessi campi vuoti.' });
    }

    await users.findOne({ username: helpers.firstLetterUppercase(request.body.username) },
      {
        posts: 0,
        notifications: 0,
        following: 0,
        followers: 0,
        chatList: 0,
        images: 0,
        profileImageId: 0,
        profileImageVersion: 0,
        coverImageId: 0,
        coverImageVersion: 0,
        city: 0,
        country: 0
      })
      .then((userFound) => {

        if (!userFound) {
          response.status(HttpStatus.NOT_FOUND).json({ message: 'Utente non registrato.' });
        }

        return bcrypt.compare(request.body.password, userFound.password)
          .then((isPasswordCorrect) => {

            if (!isPasswordCorrect) {
              response.status(HttpStatus.FORBIDDEN).json({ message: 'Password non corretta.' });
            }

            // token (jwt) => header.payload.signature
            const token = jwt.sign({ data: userFound }, dbConfiguration.secret, {
              expiresIn: '8h'
            });

            response.cookie('auth', token);

            return response.status(HttpStatus.OK).json({
              message: 'Login effettuato con successo :)',
              userFound,
              token
            });
          });
      })
      .catch((error) => {
        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Si è verificato un errore, riprovare più tardi.' });
      });
  },

  async SignupUserFaceRecognition(request, response) {

    const userEmail = await users.findOne({ email: helpers.lowerCase(request.body.email) });

    if (userEmail) {
      return response.status(HttpStatus.CONFLICT).json({ message: 'Email già registrata' });
    }

    const username = await users.findOne({ username: helpers.firstLetterUppercase(request.body.username) });

    if (username) {
      return response.status(HttpStatus.FORBIDDEN).json({ message: 'Nome utente già esistente' });
    }

    let imageId;
    let imageVersion;

    cloudinary.uploader.upload(request.body.image, async (result) => {
      imageId = result.public_id;
      imageVersion = result.version;

      URL = 'http://res.cloudinary.com/dfn8llckr/image/upload/v' + result.version + '/' + result.public_id;
      console.log(URL);

      // python function link
      exec(`npm run -s nopy -- register_new_user_face.py ${URL} ${request.body.username}`, (error, stdout, stderr) => {

        if (error) {
          console.log(`error: ${error.message}`);
          return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Si è verificato un errore, riprovare più tardi.' });
        }

        if (stderr) {
          console.log(`stderr: ${stderr}`);
          return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Si è verificato un errore, riprovare più tardi.' });
        }
      });
    });

    return bcrypt.hash(request.body.password, 10, (error, hashedPassword) => {

      if (error) {
        response.status(HttpStatus.BAD_REQUEST).json({ message: 'Errore nella codifica della password' });
      }

      const newUser = {
        username: helpers.firstLetterUppercase(request.body.username),
        email: helpers.lowerCase(request.body.email),
        password: hashedPassword
      };

      users.create(newUser)
        .then((user) => {

          // token (jwt) => header.payload.signature
          const token = jwt.sign({ data: user }, dbConfiguration.secret, {
            expiresIn: '8h'
          });

          response.cookie('auth', token);

          response.status(HttpStatus.CREATED).json({ message: 'Utente creato con successo!', user, token });

        })
        .catch((error) => {
          response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Errore interno. Riprova più tardi' });
        });
    });
  },

  async LoginUserFaceRecognition(request, response) {

    let imageId;
    let imageVersion;

    cloudinary.uploader.upload(request.body.image, async (result) => {
      imageId = result.public_id;
      imageVersion = result.version;

      URL = 'http://res.cloudinary.com/dfn8llckr/image/upload/v' + result.version + '/' + result.public_id;
      console.log(URL);

      // python function link
      exec(`npm run -s nopy -- attendance_without_comments.py ${URL}`, (error, stdout, stderr) => {

        if (error) {
          console.log(`error: ${error.message}`);
          return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Si è verificato un errore, riprovare più tardi.' });
        }

        if (stderr) {
          console.log(`stderr: ${stderr}`);
          return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Si è verificato un errore, riprovare più tardi.' });
        }

        if (!stdout) {
          return response.status(HttpStatus.NOT_FOUND).json({ message: 'No user associated with that face.' });
        }

        console.log(`stdout: ,${stdout.split('\n')[0].trim()},`);

        users.findOne({ username: helpers.firstLetterUppercase(stdout.split('\n')[0].trim()) },
          {
            posts: 0,
            notifications: 0,
            following: 0,
            followers: 0,
            chatList: 0,
            images: 0,
            profileImageId: 0,
            profileImageVersion: 0,
            coverImageId: 0,
            coverImageVersion: 0,
            city: 0,
            country: 0
          })
          .then((userFound) => {

            if (!userFound) {
              return response.status(HttpStatus.NOT_FOUND).json({ message: 'No user associated with that face.' });
            }

            // token (jwt) => header.payload.signature
            const token = jwt.sign({ data: userFound }, dbConfiguration.secret, {
              expiresIn: '8h'
            });

            response.cookie('auth', token);

            return response.status(HttpStatus.OK).json({
              message: 'Login tramite riconoscimento facciale effettuato con successo :)',
              userFound,
              token
            });
          }).catch((error) => {
          return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Si è verificato un errore, riprovare più tardi.' });
        });
      });
    });
  },

  async DeleteUser(request, response) {

    exec(`npm run -s nopy -- delete_user.py ${request.user.username}`, (error, stdout, stderr) => {

      if (error) {
        console.log(`error: ${error.message}`);
        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Si è verificato un errore, riprovare più tardi.' });
      }

      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Si è verificato un errore, riprovare più tardi.' });
      }

      if (!stdout) {
      }

      posts.deleteMany({ user_id: request.user._id })
        .then(() => {
              posts.updateOne({
                'comments.username': { $eq: request.user.username }
              },
              {
                $pull: {
                  comments: {
                    username: request.user.username
                  }
                },
                $inc: {
                  total_comments: -1
                }
              })
              .then(() => {
                users.deleteOne(request.user)
                  .then(() => {
                    response.status(HttpStatus.CREATED).json({ message: 'Utente rimosso con successo!' });
                  })
                  .catch(() => {
                    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Errore interno. Riprova più tardi' });
                  });
              })
              .catch(() => {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Errore interno. Riprova più tardi' });
              });
        })
        .catch(() => {
          response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Errore interno. Riprova più tardi' });
        });
    });
  },

  async ChangePassword(req, res) {

    const schema = Joi.object().keys({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().min(5).required(),
      confirmPassword: Joi.string().min(5).optional()
    });

    const { error, value } = Joi.validate(req.body, schema);

    if (error && error.details) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'New password should be at least of 5 characters' });
    }

    const user = await users.findOne({ _id: req.user._id });

    console.log(value.currentPassword, user.password);

    return bcrypt.compare(value.currentPassword, user.password)
      .then(async (result) => {

        if (!result) {
          return res
            .status(HttpStatus.BAD_REQUEST)
            .json({ message: 'Current Password is incorrect' });
        }

        const newpassword = await users.EncryptPassword(req.body.newPassword);

        await users.update({
          _id: req.user._id
        }, {
          password: newpassword
        }).then(() => {
          res.status(HttpStatus.OK).json({ message: 'Password Changed Successfully' });
        })
          .catch((error) => {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error Occured' });
          });
      });
  }
};
