const httpStatus = require('http-status-codes');
const users = require('../models/userModels');

module.exports = {

  async GetAllUsers(req, res) {

    // username: { $ne: req.user.username }
    await users.find({})
      .populate('posts.post_id')
      .sort({username: 1})
      .then((allUsers) => {
        return res.status(httpStatus.OK).json({ message: 'All Users', allUsers });
      })
      .catch((error) => {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.details });
      });
  }
};
