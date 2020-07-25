const httpStatus = require('http-status-codes');
const users = require('../models/userModels');

module.exports = {

  async GetAllUsers(req, res) {

    // username: { $ne: req.user.username }
    await users.find({})
      .populate('posts.postId')
        .populate('following.userFollowed')
        .populate('followers.follower')
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
        .then((userFoundByName) => {
          return res.status(httpStatus.OK).json({ message: 'User by username', userFoundByName});
        })
        .catch((error) => {
          return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.details });
        });
  }

};
