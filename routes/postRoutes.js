const express = require('express');
const router = express.Router();

const PostsMiddlewares = require('../controllers/posts');
const AuthHelper = require('../helpers/AuthHelper');


// Get All Posts Submitted by Following Users of Logged User
router.get('/posts', AuthHelper.VerifyToken, PostsMiddlewares.GetAllFollowingUsersPosts);

// Get All New Posts When Someone Submit a New Post
router.get('/posts/new/:created_at', AuthHelper.VerifyToken, PostsMiddlewares.GetAllNewPosts);

// Get All Posts From a Specific User
router.get('/posts/:username', AuthHelper.VerifyToken, PostsMiddlewares.GetAllUserPosts);

// Get a Single Post
router.get('/post/:id', AuthHelper.VerifyToken, PostsMiddlewares.GetPost);

// Logged User Submit a New Post
router.post('/post/add-post', AuthHelper.VerifyToken, PostsMiddlewares.AddPost);

// Logged User Deletes Its Own Post
router.post('/post/remove-post', AuthHelper.VerifyToken, PostsMiddlewares.RemovePost);

// Logged User Add a Specific Post In Its Favourites
router.post('/post/add-like', AuthHelper.VerifyToken, PostsMiddlewares.AddLike);

// Logged User Remove a Specific Post From Its Favourites
router.post('/post/remove-like', AuthHelper.VerifyToken, PostsMiddlewares.RemoveLike);

// Logged User Add a Comment to a Post Submitted by a Following User
router.post('/post/add-comment', AuthHelper.VerifyToken, PostsMiddlewares.AddComment);

// Logged User Delete Its Own Comment From a Post Submitted by a Following User
router.post('/post/remove-comment', AuthHelper.VerifyToken, PostsMiddlewares.RemoveComment);


module.exports = router;
