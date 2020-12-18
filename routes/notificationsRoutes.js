const express = require('express');
const router = express.Router();

const NotificationsMiddlewares = require('../controllers/notifications');
const AuthHelper = require('../helpers/AuthHelper');


// Notifications List of Logged User
router.get('/notifications-list', AuthHelper.VerifyToken, NotificationsMiddlewares.GetAllNotifications);

// Logged User Deletes Its Own Notification
router.post('/notification/delete/:id', AuthHelper.VerifyToken, NotificationsMiddlewares.DeleteNotification);

// Logged User Marks Its Own Notification As Read
router.post('/notification/mark/:id', AuthHelper.VerifyToken, NotificationsMiddlewares.MarkNotificationAsRead);

// Logged User Marks All Its Own Notifications As Read
router.post('/mark-all', AuthHelper.VerifyToken, NotificationsMiddlewares.MarkAllNotificationsAsRead);

// Adds a Notification to Person Who's Profile has been Viewed by Logged User
router.post('/user/view-profile', AuthHelper.VerifyToken, NotificationsMiddlewares.AddNotificationProfileViewed);


module.exports = router;
