const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const app = express();

app.use(cors());

const databaseConfig = require('./config/secret');

app.use((req, res, next)  => {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Credentials", "true");
   res.header('Access-Control-Allow-Methods', 'GET', 'POST', 'DELETE', 'PUT');
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
   next();
});

// token (jwt) => header.payload.signature

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended: true, limit: '50mb'}));
app.use(cookieParser());
app.use(logger('dev'));

mongoose.Promise = global.Promise;
mongoose.connect(databaseConfig.url, {useNewUrlParser: true, useUnifiedTopology: true });

const auth  = require('./routes/authRoutes');

app.use('/api/shak', auth);

app.listen(3000, () => {
   console.log('In Esecuzione sulla Porta 3000');
});
