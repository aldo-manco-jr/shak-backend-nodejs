const express = require('express');
const router = express.Router();

const FriendCtrl = require('../controllers/friends');
const AuthHelper = require('../Helpers/AuthHelper');

router.post('/follow-user', AuthHelper.VerifyToken, FriendCtrl.FollowUsers);

module.exports = router;
