const express = require('express');
const router = express.Router();

const UserCtrl = require('../controllers/users');
const AuthHelper = require('../helpers/AuthHelper');

router.get('/users', AuthHelper.VerifyToken, UserCtrl.GetAllUsers);
router.get('/users/following/:username', AuthHelper.VerifyToken, UserCtrl.GetFollowing);
router.get('/users/followers/:username', AuthHelper.VerifyToken, UserCtrl.GetFollowers);
router.get('/users/is-following/:username', AuthHelper.VerifyToken, UserCtrl.IsFollowing);
router.get('/user/:id', AuthHelper.VerifyToken, UserCtrl.GetUserById);
router.get('/username/:username', AuthHelper.VerifyToken, UserCtrl.GetUserByName);
router.post('/user/view-profile', AuthHelper.VerifyToken, UserCtrl.ProfileView);
router.post('/user/location', AuthHelper.VerifyToken, UserCtrl.SetUserLocation);
router.post('/change-password', AuthHelper.VerifyToken, UserCtrl.ChangePassword);

module.exports = router;
