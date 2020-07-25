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
        };

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
                });
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
                .sort({created_at: -1});

            return res.status(HttpStatus.OK).json({message: 'All posts', allPosts});
        } catch (err) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: 'Error occured'});
        }
    },

    async AddLike(req, res) {

        const postId = req.body._id;

        await posts.updateOne({
                _id: postId,
                'likes.username': {$ne: req.user.username}
            },
            {
                $push: {
                    likes: {
                        username: req.user.username
                    }
                },
                $inc: {
                    total_likes: 1
                }
            })
            .then(() => {
                return res.status(HttpStatus.OK).json({message: 'You have liked the post'});
            })
            .catch((err) => {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: 'Error occured'});
            });
    },

    async AddComment(req, res) {

        const postId = req.body.postId;

        await posts.updateOne({
                _id: postId
            },
            {
                $push: {
                    comments: {
                        user_id: req.user.id,
                        username: req.user.username,
                        comment_text: req.body.comment,
                        created_at: new Date()
                    }
                }
            })
            .then(() => {
                return res.status(HttpStatus.OK).json({message: 'You have commented the post'});
            })
            .catch((err) => {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: 'Error occured'});
            });
    },

    async GetPost(req, res) {
        await posts.findOne({_id: req.params.id})
            .populate('user_id')
            .populate('comments.user_id')
            .then((post) => {
                res.status(HttpStatus.OK).json({message: 'Post Found', post})
            })
            .catch(err =>
                res
                    .status(HttpStatus.NOT_FOUND)
                    .json({message: 'Post Not Found'}))
    }
};
