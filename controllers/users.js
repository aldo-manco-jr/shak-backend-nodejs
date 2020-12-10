const httpStatus = require('http-status-codes');
const moment = require('moment');
const Joi = require('joi');
const bcrypt = require('bcryptjs');

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
      .sort({ username: 1 })
      .then((allUsers) => {
        return res.status(httpStatus.OK).json({ message: 'All Users', allUsers });
      })
      .catch((error) => {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.details });
      });
  },

  async GetUserById(req, res) {

    // username: { $ne: req.user.username }
    await users.findOne({ _id: req.params.id })
      .populate('posts.postId')
      .populate('following.userFollowed')
      .populate('followers.follower')
      .populate('chatList.receiverId')
      .populate('chatList.msgId')
      .populate('notifications.senderId')
      .then((userFoundById) => {
        return res.status(httpStatus.OK).json({ message: 'User by id', userFoundById });
      })
      .catch((error) => {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.details });
      });
  },

  async GetUserByName(req, res) {

    // username: { $ne: req.user.username }
    await users.findOne({ username: req.params.username })
      .populate('posts.postId')
      .populate('following.userFollowed')
      .populate('followers.follower')
      .populate('chatList.receiverId')
      .populate('chatList.msgId')
      .populate('notifications.senderId')
      .then((userFoundByName) => {
        return res.status(httpStatus.OK).json({ message: 'User by username', userFoundByName });
      })
      .catch((error) => {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.details });
      });
  },

  async ProfileView(req, res) {

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
      return res.status(httpStatus.OK).json({ message: 'Notificaion sent' });
    })
      .catch((error) => {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error Occured' });
      });
  },

  async SetUserLocation(req, res) {

    await users.updateOne({
      _id: req.user._id
    }, {
      city: req.body.city,
      country: req.body.country
    }).then((userFoundByName) => {
      res.status(httpStatus.OK).json({ message: 'Location updated' });
    })
      .catch(err => {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error Occured' });
      });
  },

  async ChangePassword(req, res) {

    const schema = Joi.object().keys({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().min(5).required(),
      confirmPassword: Joi.string().min(5).optional()
    });

    const { error, value } = Joi.validate(req.body, schema);

    if (error && error.details) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: 'New password should be at least of 5 characters' });
    }

    const user = await users.findOne({ _id: req.user._id });

    console.log(value.currentPassword, user.password);

    return bcrypt.compare(value.currentPassword, user.password)
      .then(async (result) => {

        if (!result) {
          return res
            .status(httpStatus.BAD_REQUEST)
            .json({ message: 'Current Password is incorrect' });
        }

        const newpassword = await users.EncryptPassword(req.body.newPassword);

        await users.update({
          _id: req.user._id
        }, {
          password: newpassword
        }).then(() => {
          res.status(httpStatus.OK).json({ message: 'Password Changed Successfully' });
        })
          .catch((error) => {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error Occured' });
          });
      });
  },

  async GetFollowing(req, res) {

    const user = await users.findOne({
      username: req.params.username
    });

    await users.find({
      'followers.follower': { $eq: user._id }
    })
      .sort({ username: 1 })
      .then((followingList) => {
        return res.status(httpStatus.OK).json({ message: 'Following Users', followingList });
      })
      .catch((error) => {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'porcaccio olive' + error.details });
      });
  },

  async IsFollowing(req, res) {

    const user = await users.findOne({
      username: req.params.username
    });

    console.log(user.username+ "porco oli");

    /*await users.findOne({ username: req.params.username })
      .populate('posts.postId')
      .populate('following.userFollowed')
      .populate('followers.follower')
      .populate('chatList.receiverId')
      .populate('chatList.msgId')
      .populate('notifications.senderId')
      .then((userFoundByName) => {
        return res.status(httpStatus.OK).json({ message: 'User by username', userFoundByName });
      })
      .catch((error) => {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.details });
      });*/

    await users.findOne({
      username: req.params.username,
      'followers.follower': { $eq: req.user._id }
    }).then((userFoundByName) => {
      if (userFoundByName){
        return res.status(httpStatus.OK).json({ message: 'yes'});
      }else {
        return res.status(httpStatus.OK).json({ message: 'no'});
      }
    })
      .catch((error) => {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.details });
      });
  },

  async GetFollowers(req, res) {

    const user = await users.findOne({
      username: req.params.username
    });

    await users.find({
      'following.userFollowed': { $eq: user._id }
    })
      .sort({ username: 1 })
      .then((followersList) => {
        return res.status(httpStatus.OK).json({ message: 'Followers Users', followersList });
      })
      .catch((error) => {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.details });
      });
  }
};
