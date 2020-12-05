const HttpStatus = require('http-status-codes');

const User = require('../models/userModels');

module.exports = {

    FollowUsers(req, res) {

        const followUser = async () => {

            await User.update({
                _id: req.user._id,
                "following.userFollowed": {$ne: req.body.userFollowed}
            }, {
                $push: {
                    following: {
                        userFollowed: req.body.userFollowed
                    }
                }
            });

            await User.update({
                _id: req.body.userFollowed,
                "followers.follower": {$ne: req.user._id}
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
              res.status(HttpStatus.OK).json({message: 'Following accepted'})
          })
          .catch(err => {
              res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: 'Error Occured'})
          });
    },

    UnFollowUser(req, res) {

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
                res.status(HttpStatus.OK).json({message: 'unFollowing accepted'})
            })
            .catch(err => {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: 'Error Occured'})
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
                    $set: {'notifications.$.read': true}
                }
            )
                .then(() => {
                    res.status(HttpStatus.OK).json({message: ' marked as read'});
                }).catch(err => {
                    res
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .json({message: 'Error Occured'});
                });

        }else{

            //eliminazione della notifica
            await User.update({
                _id: req.user._id,
                'notifications._id': req.params.id
            },
            {
                $pull: {
                    notifications: {_id: req.params.id}
                }
            }
            )
                .then(() => {
                res.status(HttpStatus.OK).json({message: ' Deleted Successfully'});
            }).catch(err => {
                res
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .json({message: 'Error Occured'});
            });
        }
    },

    async MarkAllNotifications(req,res){

        await User.update({
            _id: req.user._id
        },{
            $set: {'notifications.$[elem].read': true } },
            {arrayFilters:[{'elem.read':false}], multi: true }
         )
            .then(() => {
                res.status(HttpStatus.OK).json({message: ' marked all successfully '});
            }).catch(err => {
                res
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .json({message: 'Error Occured'});
            });
    }
};
