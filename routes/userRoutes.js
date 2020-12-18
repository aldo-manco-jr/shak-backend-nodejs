const express = require('express');
const router = express.Router();

const UsersMiddlewares = require('../controllers/users');
const AuthHelper = require('../helpers/AuthHelper');


// Get All Users Signed Up to SHAK
router.get('/users', AuthHelper.VerifyToken, UsersMiddlewares.GetAllUsers);

// Get a Single User by Its Primary Key (Id, Username)
router.get('/user/id/:id', AuthHelper.VerifyToken, UsersMiddlewares.GetUserById);
router.get('/user/username/:username', AuthHelper.VerifyToken, UsersMiddlewares.GetUserByName);

// Set Location of Logged User
router.put('/user/location/:id', AuthHelper.VerifyToken, UsersMiddlewares.SetUserLocation);

// Check If Logged User is Following a Specific User
router.get('/user/is-following/:username', AuthHelper.VerifyToken, UsersMiddlewares.IsFollowing);

// Get Following Users List of Logged User
router.get('/user/following/:username', AuthHelper.VerifyToken, UsersMiddlewares.GetFollowing);

// Get Followers Users List of Logged User
router.get('/user/followers/:username', AuthHelper.VerifyToken, UsersMiddlewares.GetFollowers);

// Add a Specific User to the Following Users List of Logged User
router.post('/user/follow/:userFollowed', AuthHelper.VerifyToken, UsersMiddlewares.FollowUser);

// Remove a Specific User from the Following Users List of Logged User
router.delete('/user/follow/:userFollowed', AuthHelper.VerifyToken, UsersMiddlewares.UnfollowUser);


module.exports = router;
