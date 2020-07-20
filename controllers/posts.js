const Joi = require('joi');
const HttpStatus = require('http-status-codes');

const posts = require('../models/postModels');
const users = require('../models/userModels');

module.exports = {

    AddPost(req, res) {
        const schemaPost = Joi.object().keys({
            post: Joi.string().required()
        });

        const {error} = Joi.validate(req.body, schemaPost);

        if (error && error.details) {
            return res
                .status(HttpStatus.BAD_REQUEST)
                .json({msg: error.details});
        }

        const body = {
            user_id: req.user._id,
            username: req.user.username,
            post: req.body.post,
            created_at: new Date()
        }

        posts.create(body)
            .then(async post => {
                await users.updateOne({
                    _id: req.user._id
                }, {
                    $push: {
                        posts: {
                            postId: post._id,
                            post: req.body.post,
                            created_at: new Date()
                        }
                    }
                })
                res.status(HttpStatus.OK).json({message: 'Post created successfully', post});
            }).catch(err => {
            res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .json({message: 'Error occured'});

        });
    },

    async GetAllPosts(req, res) {

        try {
            const allPosts = await posts.find({})
                .populate('user_id')
                .sort({ created_at: -1 });

            return res.status(HttpStatus.OK).json({message: 'All posts', allPosts});
        } catch (err) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: 'Error occured'});
        }
    }

};
