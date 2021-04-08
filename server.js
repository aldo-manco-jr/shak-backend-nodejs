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

   (dotenv)
      Package che gestisce i file .env
 */

// Libraries Imported
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const _ = require('lodash');
require("dotenv").config()

//Mongo DB Config
const username = process.env.MONGO_INITDB_ROOT_USERNAME
const password = process.env.MONGO_INITDB_ROOT_PASSWORD
const dbName = process.env.MONGO_INITDB_DATABASE

const url = 'mongodb://' +
    username + ':' +
    password + '@' +
    'mongodb' + ':' +
    27017 + '/' +
    dbName + '?authSource=' +
    'admin'

const mongoOptions = {
   user: username,
   pass: password,
   dbName: dbName,
   useNewUrlParser: true,
   useUnifiedTopology: true,
   useCreateIndex: true,
   useFindAndModify: false,
   autoIndex: false
}

// Creates API
const app = express();

// Links Front-End -> API
app.use(cors());

// Secret Data Access for Database
const databaseConfig = require('./config/secret');

// Create Server and Initialize Socket to Listen Server's Changes
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

// Class of Helper Methods
const {User} = require('./helpers/UserClass');

// Defined Socket Behaviors
require('./socket/streams')(io, User, _);
require('./socket/private')(io);

// Express Routes Which Handles Http Request from Android
const authenticationRoutes  = require('./routes/authRoutes');
const postsRoutes  = require('./routes/postRoutes');
const usersRoutes = require('./routes/userRoutes');
const notificationsRoutes = require('./routes/notificationsRoutes');
const chatRoutes = require('./routes/messageRoutes');
const imagesRoutes = require('./routes/imageRoutes');

// Express Routes Which Handles Http Request from Angular
const angularAuthenticationRoutes  = require('./routes-angular/authRoutes');
const angularPostsRoutes  = require('./routes-angular/postRoutes');
const angularUsersRoutes = require('./routes-angular/userRoutes');
const angularFriendsRoutes = require('./routes-angular/friendsRoutes');
const angularChatRoutes = require('./routes-angular/messageRoutes');
const angularImagesRoutes = require('./routes-angular/imageRoutes');

// Impostazione Permessi, Funzionalità API
// app.use((req, res, next)  => {
//    res.header("Access-Control-Allow-Origin", "*");
//    res.header("Access-Control-Allow-Credentials", "true");
//    res.header('Access-Control-Allow-Methods', 'GET', 'POST', 'DELETE', 'PUT');
//    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//    next();
// });

// Global Middlewares by Express
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended: true, limit: '50mb'}));

// inizializzo il cookie
app.use(cookieParser());

// Global Middleware of Express Which Prints Http Request and Response Data
// app.use(logger('dev'));

// Declares Return Data Type of Query Done With Mongoose
mongoose.Promise = global.Promise;

// Connect Server with Database
const LOG_TAG = '\t[MONGODB]\t|'
mongoose.connect(url, mongoOptions)
    .then(() => {
       console.log(LOG_TAG + 'Connected')
    })
    .catch((error) => {
       console.trace(error)
    })

const timeout = require('connect-timeout')

app.use(timeout('60000s'))
app.use(haltOnTimedout)

// Routes used as Global Middlewares by Express for Android's HTTP Request
app.use('/api/shak', authenticationRoutes);
app.use('/api/shak', postsRoutes);
app.use('/api/shak', usersRoutes);
app.use('/api/shak', notificationsRoutes);
app.use('/api/shak', chatRoutes);
app.use('/api/shak', imagesRoutes);

// Routes used as Global Middlewares by Express for Angular's HTTP Request
app.use('/api/shak', angularAuthenticationRoutes);
app.use('/api/shak', angularFriendsRoutes);
app.use('/api/shak', angularImagesRoutes);
app.use('/api/shak', angularPostsRoutes);
app.use('/api/shak', angularUsersRoutes);
app.use('/api/shak', angularChatRoutes);

function haltOnTimedout (req, res, next) {
   if (!req.timedout) next()
}

// Initialize Server
server.listen(3000, () => {
   console.log('SHAK Server is Listening on Port 3000');
});
