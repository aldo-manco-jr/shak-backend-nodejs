const express = require('express');
const router = express.Router();

const MessageCtrl = require('../controllers-angular/message');
const AuthHelper = require('../helpers/AuthHelper');

router.get('/chat-messages/:senderId/:receiverId', AuthHelper.VerifyToken, MessageCtrl.GetAllMessages);

router.get('/receiver-messages/:sender/:receiver', AuthHelper.VerifyToken, MessageCtrl.MarkReceiverMessages);

router.get('/mark-all-messages', AuthHelper.VerifyToken, MessageCtrl.MarkAllMessages);

router.post('/chat-messages/:senderId/:receiverId', AuthHelper.VerifyToken, MessageCtrl.SendMessage);

module.exports = router;
