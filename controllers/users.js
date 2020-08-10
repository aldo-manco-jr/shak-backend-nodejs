const httpStatus = require('http-status-codes');
const moment = require('moment');

const users = require('../models/userModels');

module.exports = {

  async GetAllUsers(req, res) {

    // username: { $ne: req.user.username }
    await users.find({})
      .populate('posts.postId')
        .populate('following.userFollowed')
        .populate('followers.follower')
        .populate('chatList.receiverId')
        .populate('chatList.msgId')
        .populate('notifications.senderId')
      .sort({username: 1})
      .then((allUsers) => {
        return res.status(httpStatus.OK).json({ message: 'All Users', allUsers });
      })
      .catch((error) => {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.details });
      });
  },

  async GetUserById(req, res) {

    // username: { $ne: req.user.username }
    await users.findOne({_id: req.params.id})
        .populate('posts.postId')
        .populate('following.userFollowed')
        .populate('followers.follower')
        .populate('chatList.receiverId')
        .populate('chatList.msgId')
        .populate('notifications.senderId')
        .then((userFoundById) => {
          return res.status(httpStatus.OK).json({ message: 'User by id', userFoundById});
        })
        .catch((error) => {
          return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.details });
        });
  },

  async GetUserByName(req, res) {

    // username: { $ne: req.user.username }
    await users.findOne({ username: req.params.username})
        .populate('posts.postId')
        .populate('following.userFollowed')
        .populate('followers.follower')
        .populate('chatList.receiverId')
        .populate('chatList.msgId')
        .populate('notifications.senderId')
        .then((userFoundByName) => {
          return res.status(httpStatus.OK).json({ message: 'User by username', userFoundByName});
        })
        .catch((error) => {
          return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.details });
        });
  },

   async ProfileView(req,res) {
      const dateValue = moment().format('YYYY-MM-DD')
      await users.update({
          _id: req.body.id,
          'notifications.date':{$ne: [dateValue, '']},
              'notifications.senderId':{$ne: req.user._id}
      }, {
        $push: {
            notifications: {
                senderId: req.user._id,
                message: `${req.user.username} viewed your profile`,
                created: new Date(),
                date: dateValue,
                viewProfile : true
            }
        }
      }
      ).then((userFoundByName) => {
          return res.status(httpStatus.OK).json({ message: 'Notificaion sent'});
      })
          .catch((error) => {
              return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error Occured' });
          });
   }
};
