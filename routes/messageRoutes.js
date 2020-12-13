const express = require('express');
const router = express.Router();

const ChatMiddlewares = require('../controllers/message');
const AuthHelper = require('../helpers/AuthHelper');


// Get All Messages of a Specific Conversation
router.get('/chat-messages/:senderId/:receiverId', AuthHelper.VerifyToken, ChatMiddlewares.GetAllConversationMessages);

// Mark Single Receiver's Message in a Conversation as Read
router.get('/receiver-messages/:sender/:receiver', AuthHelper.VerifyToken, ChatMiddlewares.MarkSingleReceiverMessageAsRead);

// Mark All Receiver's Messages in a Conversation as Read
router.get('/mark-all-messages', AuthHelper.VerifyToken, ChatMiddlewares.MarkAllReceiverMessagesAsRead);

// Send a Message in a Conversation
router.post('/chat-messages/:senderId/:receiverId', AuthHelper.VerifyToken, ChatMiddlewares.SendMessage);


module.exports = router;
