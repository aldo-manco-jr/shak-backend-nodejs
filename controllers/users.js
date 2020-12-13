const httpStatus = require('http-status-codes');
const moment = require('moment');
const Joi = require('joi');
const bcrypt = require('bcryptjs');

const users = require('../models/userModels');

module.exports = {

  async GetAllUsers(req, res) {

    await users.find({
      _id : {$ne: req.user._id}
    })
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

  async IsFollowing(req, res) {

    const user = await users.findOne({
      username: req.params.username
    });

    await users.findOne({
      username: req.params.username,
      'followers.follower': { $eq: req.user._id }
    }).then((userFoundByName) => {
      if (userFoundByName) {
        return res.status(httpStatus.OK).json({ message: 'yes' });
      } else {
        return res.status(httpStatus.OK).json({ message: 'no' });
      }
    })
      .catch((error) => {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.details });
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
  },

  FollowUser(req, res) {

    const followUser = async () => {

      await User.update({
        _id: req.user._id,
        'following.userFollowed': { $ne: req.body.userFollowed }
      }, {
        $push: {
          following: {
            userFollowed: req.body.userFollowed
          }
        }
      });

      await User.update({
        _id: req.body.userFollowed,
        'followers.follower': { $ne: req.user._id }
      }, {
        $push: {
          followers: {
            follower: req.user._id
          },
          notifications: {
            senderId: req.user._id,
            message: `${req.user.username} is now following you.`,
            created: new Date(),
            viewProfile: false
          }
        }
      });
    };

    followUser()
      .then(() => {
        res.status(HttpStatus.OK).json({ message: 'Following accepted' });
      })
      .catch(err => {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error Occured' });
      });
  },

  UnfollowUser(req, res) {

    const unFollowUser = async () => {

      await User.update({
        _id: req.user._id
      }, {
        $pull: {
          following: {
            userFollowed: req.body.userFollowed
          }
        }
      });

      await User.update({
        _id: req.body.userFollowed
      }, {
        $pull: {
          followers: {
            follower: req.user._id
          }
        }
      });
    };

    unFollowUser()
      .then(() => {
        res.status(HttpStatus.OK).json({ message: 'unFollowing accepted' });
      })
      .catch(err => {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error Occured' });
      });
  }
};
