const HttpStatus = require('http-status-codes');

const User = require('../models/userModels');

module.exports = {

  async GetAllNotifications(req, res) {

    await User.findOne({ username: req.user.username })
      .then((user) => {

        let notificationsExtractFunction = function() {
          let notificationsList = [];
          if (typeof user.notifications != 'undefined') {
            for (let i = 0; i < user.notifications.length; i++) {
              notificationsList.push(user.notifications[i]);
            }
          }
          return notificationsList;
        };

        let notificationsList = notificationsExtractFunction();

        return res.status(HttpStatus.OK).json({ message: 'Get all logged user\'s notifications list', notificationsList });
      })
      .catch((error) => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.details });
      });
  },

  async DeleteNotification(req, res) {

    await User.update({
        _id: req.user._id,
        'notifications._id': req.params.id
      },
      {
        $pull: {
          notifications: { _id: req.params.id }
        }
      }
    )
      .then(() => {
        res.status(HttpStatus.OK).json({ message: 'Notification Deleted Successfully' });
      }).catch(err => {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error Occured' });
      });
  },

  async MarkNotificationAsRead(req, res) {

    await User.updateOne({
        _id: req.user._id,
        'notifications._id': req.params.id
      },
      {
        //settiamo il campo read di notifications in userModel.js
        $set: { 'notifications.$.read': true }
      }
    )
      .then(() => {
        res.status(HttpStatus.OK).json({ message: 'Notification marked as read' });
      }).catch(err => {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error Occured' });
      });
  },

  async MarkAllNotificationsAsRead(req, res) {

    await User.update({
        _id: req.user._id
      }, {
        $set: { 'notifications.$[elem].read': true }
      },
      { arrayFilters: [{ 'elem.read': false }], multi: true }
    )
      .then(() => {
        res.status(HttpStatus.OK).json({ message: ' marked all successfully ' });
      }).catch(err => {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error Occured' });
      });
  },

  async AddNotificationProfileViewed(req, res) {

    const dateValue = moment().format('YYYY-MM-DD');

    await users.update({
        _id: req.body.id,
        'notifications.date': { $ne: [dateValue, ''] },
        'notifications.senderId': { $ne: req.user._id }
      }, {
        $push: {
          notifications: {
            senderId: req.user._id,
            message: `${req.user.username} viewed your profile`,
            created: new Date(),
            date: dateValue,
            viewProfile: true
          }
        }
      }
    ).then((userFoundByName) => {
      return res.status(HttpStatus.OK).json({ message: 'Notification sent' });
    })
      .catch((error) => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error Occured' });
      });
  },

  async MarkNotification(req, res) {

    //se contiene deleteval verrà cancellata la notifica
    if (!req.body.deleteValue) {
      await User.updateOne({
          _id: req.user._id,
          'notifications._id': req.params.id
        },
        {
          //settiamo il campo read di notifications in userModel.js
          $set: { 'notifications.$.read': true }
        }
      )
        .then(() => {
          res.status(HttpStatus.OK).json({ message: ' marked as read' });
        }).catch(err => {
          res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: 'Error Occured' });
        });

    } else {

      //eliminazione della notifica
      await User.update({
          _id: req.user._id,
          'notifications._id': req.params.id
        },
        {
          $pull: {
            notifications: { _id: req.params.id }
          }
        }
      )
        .then(() => {
          res.status(HttpStatus.OK).json({ message: ' Deleted Successfully' });
        }).catch(err => {
          res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: 'Error Occured' });
        });
    }
  }
};
