/*
   (express)
      Applicazione Endpoint che gestisce richieste http del client contenenti i dati dell'utente.
      Permette la creazione di API.

   (mongoose)
      package di driver che permette la traduzione di schemi fatti in Node.JS in MongoDB,
      di gestire le relazioni, fare query, controlli sugli schemi, etc.

   (cookieParser)
      Middleware che permette l'analisi e l'inserimento dei dati richiesti dall'utente nei cookies

   (cors)
      Middleware che permette il collegamento del Front-End con le API (Express),

   (nodemon)
      Package che permette al server ti rimanere sempre in ascolto
 */

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const _ = require('lodash');

// Creazione API
const app = express();

// Collegamento Front-End -> API
app.use(cors());

// Dati accesso al database
const databaseConfig = require('./config/secret');

const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

const {User} = require('./helpers/UserClass');

require('./socket/streams')(io, User, _);
require('./socket/private')(io);

// gestisce le HTTP Request Post ricevute
const auth  = require('./routes/authRoutes');
const posts  = require('./routes/postRoutes');
const users = require('./routes/userRoutes');
const friends = require('./routes/friendsRoutes');
const message = require('./routes/messageRoutes');

// Impostazione Permessi, Funzionalità API
// app.use((req, res, next)  => {
//    res.header("Access-Control-Allow-Origin", "*");
//    res.header("Access-Control-Allow-Credentials", "true");
//    res.header('Access-Control-Allow-Methods', 'GET', 'POST', 'DELETE', 'PUT');
//    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//    next();
// });

// token (jwt) => header.payload.signature

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended: true, limit: '50mb'}));

// inizializzo il cookie
app.use(cookieParser());
//app.use(logger('dev'));

// dichiarazione del tipo di dato restituito dalle query fatte in Mongoose
mongoose.Promise = global.Promise;
// collegamento con il database specificato in (databaseConfig)
mongoose.connect(databaseConfig.url, {useNewUrlParser: true, useUnifiedTopology: true });

app.use('/api/shak', auth);
app.use('/api/shak', posts);
app.use('/api/shak', users);
app.use('/api/shak', friends);
app.use('/api/shak', message);

// inizializzazione server
server.listen(3000, () => {
   console.log('In Esecuzione sulla Porta 3000');
});
