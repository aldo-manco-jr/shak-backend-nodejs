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
    ],

    following: [
        {userFollowed: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}}
    ],

    followers: [
        {follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}}
    ],

    notifications: [
        {
            senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            message: { type: String },
            viewProfile: { type: Boolean, default: false },
            created: { type: Date, default: Date.now() },
            read: { type: Boolean, default: false },
            date: { type: String, default: '' }
        }
    ],

    chatList: [
        {
            receiverId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
            msgId: {type: mongoose.Schema.Types.ObjectId, ref: 'Message'}
        }
    ],

    profileImageId: {type: String , default: 'qktq4chaw5bk7xdwwieu.jpg' },
    profileImageVersion: { type: String, default: '1596898350' },

    images: [
        {
            imageId : { type: String, default:'' },
            imageVersion : { type: String, default:'' }
        }
    ]
});

// esportazione schema
module.exports = mongoose.model('User', userSchema);
