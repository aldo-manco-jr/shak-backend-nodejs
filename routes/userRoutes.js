const express = require('express');
const router = express.Router();

const UsersMiddlewares = require('../controllers/users');
const AuthHelper = require('../helpers/AuthHelper');


// Get All Users Signed Up to SHAK
router.get('/user/list/all', AuthHelper.VerifyToken, UsersMiddlewares.GetAllUsers);

// Get a Single User by Its Alternative Key (username)
router.get('/user/:username', AuthHelper.VerifyToken, UsersMiddlewares.GetUserByUsername);

// Set Location of Logged User
router.put('/user/location/:id', AuthHelper.VerifyToken, UsersMiddlewares.SetUserLocation);

// Check If Logged User is Following a Specific User
router.get('/user/follow/:username', AuthHelper.VerifyToken, UsersMiddlewares.IsFollowing);

// Get Following Users List of Logged User
router.get('/user/list/following/:username', AuthHelper.VerifyToken, UsersMiddlewares.GetFollowing);

// Get Followers Users List of Logged User
router.get('/user/list/followers/:username', AuthHelper.VerifyToken, UsersMiddlewares.GetFollowers);

// Add a Specific User to the Following Users List of Logged User
router.post('/user/follow/:userFollowed', AuthHelper.VerifyToken, UsersMiddlewares.FollowUser);

// Remove a Specific User from the Following Users List of Logged User
router.delete('/user/follow/:userFollowed', AuthHelper.VerifyToken, UsersMiddlewares.UnfollowUser);


module.exports = router;
