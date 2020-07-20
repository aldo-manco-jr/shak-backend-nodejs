const mongoose = require('mongoose');

/*
    Definizione Schema Utente
 */

const userSchema = mongoose.Schema({
    username: {type: String},
    email: {type: String},
    password: {type: String},
    posts: [
        {
            postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
            post: { type: String },
            created_at: { type: Date, default: Date.now() }
        }
    ]
});

// esportazione schema
module.exports = mongoose.model('User', userSchema);
