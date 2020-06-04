const mongoose = require('mongoose');

/*
    Definizione Schema Utente
 */

const userSchema = mongoose.Schema({
    username: {type: String},
    email: {type: String},
    password: {type: String}
});

// esportazione schema
module.exports = mongoose.model('User', userSchema);
