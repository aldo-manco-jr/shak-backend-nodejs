const express = require('express');
const router = express.Router();

const UsersMiddlewares = require('../controllers/users');
const AuthHelper = require('../helpers/AuthHelper');


// Get All Users Signed Up to SHAK
router.get('/users', AuthHelper.VerifyToken, UsersMiddlewares.GetAllUsers);

// Get a Single User by Its Primary Key (Id, Username)
router.get('/user/:id', AuthHelper.VerifyToken, UsersMiddlewares.GetUserById);
router.get('/username/:username', AuthHelper.VerifyToken, UsersMiddlewares.GetUserByName);

// Set Location of Logged User
router.post('/user/location', AuthHelper.VerifyToken, UsersMiddlewares.SetUserLocation);

// Check If Logged User is Following a Specific User
router.get('/users/is-following/:username', AuthHelper.VerifyToken, UsersMiddlewares.IsFollowing);

// Get Following Users List of Logged User
router.get('/users/following/:username', AuthHelper.VerifyToken, UsersMiddlewares.GetFollowing);

// Get Followers Users List of Logged User
router.get('/users/followers/:username', AuthHelper.VerifyToken, UsersMiddlewares.GetFollowers);

// Add a Specific User to the Following Users List of Logged User
router.post('/follow-user', AuthHelper.VerifyToken, UsersMiddlewares.FollowUser);

// Remove a Specific User from the Following Users List of Logged User
router.post('/unfollow-user', AuthHelper.VerifyToken, UsersMiddlewares.UnfollowUser);


module.exports = router;
