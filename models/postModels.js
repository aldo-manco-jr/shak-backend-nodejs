const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    username: { type: String, default: ''},
    post: { type: String, default: ''},
    imageVersion: { type: String, default: ''},
    imageId: { type: String, default: ''},
    comments:[
        {
            user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
            username: { type: String, default: ''},
            comment_text: { type: String, default: ''},
            created_at: { type: Date, default: Date.now()}
        }
    ],
    total_likes: { type: Number, default: 0 },
    likes: [
        {
            username: { type: String, default:''}
        }
    ],
    created_at: { type: Date, default: Date.now() }
});

module.exports = mongoose.model('Post', postSchema);
