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
   },


    async ChangePassword(req,res){
        const schema = Joi.object().keys({
            currentPassword: Joi.string().required(),
            newPassword: Joi.string().min(5).required(),
            confirmPassword: Joi.string().min(5).optional(),
        });

        const { error, value } = Joi.validate(req.body, schema);
        if(error && error.details){
            return res
                .status(httpStatus.BAD_REQUEST)
                .json({message: error.details})
        }
        const user = await users.findOne({_id: req.user._id});

        return bcrypt.compare(value.currentPassword, user.password).then( async (result) => {
            if(!result){
                return res
                    .status(httpStatus.INTERNAL_SERVER_ERROR)
                    .json({message: 'Current Password is incorrect'})
            }

            const newpassword = await users.EncryptPassword(req.body.newPassword);
            console.log(newpassword);
        });
    }
};
