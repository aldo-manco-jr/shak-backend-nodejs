/*TODO
POST
user_id: 0,
username: 0,
post:0,
imageVersion
imageId
comments
total_likes
likes
created_at
total_comments:0

USER
username: 0,
email: 0,
password: 0,
posts:0,
following: 0,
followers: 0,
notifications: 0,
profileImageId: 0,
profileImageVersion: 0,
coverImageId: 0,
coverImageVersion: 0,
images: 0,
city: 0,
country: 0
*/
//TODO AGGIUNGERE .limit(10) per prendere solo un parte dei documenti
const Joi = require('joi');
const HttpStatus = require('http-status-codes');
const cloudinary = require('cloudinary');
const moment = require('moment');
const request = require('request');
const mongoose = require('mongoose');
//const ObjectId = mongoose.Schema.ObjectID;
//const ObjectId = require('mongodb').ObjectID;

cloudinary.config({
  cloud_name: 'dfn8llckr',
  api_key: '575675419138435',
  api_secret: 'lE_zxe8vYudPLseXYFAJojyyTpc'
});

const posts = require('../models/postModels');
const users = require('../models/userModels');

module.exports = {

  async GetAllFollowingUsersPosts(req, res) {
//TODO usare limit e restituirlo all'utente per sapere da dove cominciare a chiedere i dat
// (l'utente poi in richiesta dovrà comunicare la data più vecchia e quella più nuova dei post)
    const today = moment().startOf('day');
    const oneMonthAgo = moment(today).subtract(31, 'days');

    try {
      const loggedUser = await users.findOne({
        _id: req.user._id
      }, {
        username: 0,
        email: 0,
        password: 0,
        posts:0,
        followers: 0,
        notifications: 0,
        profileImageId: 0,
        profileImageVersion: 0,
        coverImageId: 0,
        coverImageVersion: 0,
        images: 0,
        city: 0,
        country: 0
      });

      let followingArray = function() {
        let followingObjectArray = [];
        if (typeof loggedUser.following != 'undefined') {
          for (let i = 0; i < loggedUser.following.length; i++) {
            followingObjectArray.push(loggedUser.following[i].userFollowed);
          }
        }

        return followingObjectArray;
      };

      const following = followingArray();

      // vengono presi tutti i post dell'utente che ha effettuato il login e dei suoi following
      const allPosts = await posts.find({
        $and: [
          {
            $or: [
              { 'username': { $eq: req.user.username } },
              { 'user_id': { $in: following } }
            ]
          },
          {
            created_at: { $gte: oneMonthAgo.toDate() }
          }
        ]
      }, {
        comments: 0
      })
        .lean()
        .populate('user_id', {'email':0, 'password':0, 'posts':0, 'followers':0, 'following':0,
          'notifications':0, 'chatList':0, 'images':0})
        .sort({ created_at: -1 })
        .then((posts) => {
            for (let i = 0; i < posts.length; i++) {
              posts[i].is_liked = posts[i].likes.some(like => like.username === req.user.username);
              delete posts[i].likes;
            }

            return posts;
          }).catch(err => {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: 'Error occured'})
          });

      const top = await posts.find({
        'likes.username': { $eq: req.user.username },
        created_at: { $gte: oneMonthAgo.toDate() }
      }, {
        comments: 0,
        likes: 0
      })
        .lean()
        .populate('user_id', {'email':0, 'password':0, 'posts':0, 'followers':0, 'following':0,
          'notifications':0, 'chatList':0, 'images':0})
        .sort({ created_at: -1 })
        .then((posts) => {
            for (let i = 0; i < posts.length; i++) {
              // sono già stati estratti i preferiti, quindi hanno tutti un like da parte dell'utente
              posts[i].is_liked = true;
            }

            return posts;
          }).catch((err) => {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message: 'Error occured'})
          });

      if (loggedUser.city === '' && loggedUser.country === '') {
        //TODO a cosa serve?
        request('http://geolocation-db.com/json/', { json: true }, async (err, res, body) => {

          await users.updateOne({
            _id: req.user._id
          }, {
            city: body.city,
            country: body.country_name
          });
        });
      }

      res.status(HttpStatus.OK).json({ message: 'All posts', allPosts, top });
    } catch (err) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' });
    }
  },

  async GetAllSearchedFollowingUsersPosts(req, res) {
//TODO usare limit e restituirlo all'utente per sapere da dove cominciare a chiedere i dat
// (l'utente poi in richiesta dovrà comunicare la data più vecchia e quella più nuova dei post)
    const today = moment().startOf('day');
    const oneMonthAgo = moment(today).subtract(31, 'days');

    try {
      const loggedUser = await users.findOne({
        _id: req.user._id
      }, {
        username: 0,
        email: 0,
        password: 0,
        posts: 0,
        followers: 0,
        notifications: 0,
        profileImageId: 0,
        profileImageVersion: 0,
        coverImageId: 0,
        coverImageVersion: 0,
        images: 0,
        city: 0,
        country: 0
      });

      let followingArray = function() {
        let followingObjectArray = [];
        if (typeof loggedUser.following != 'undefined') {
          for (let i = 0; i < loggedUser.following.length; i++) {
            followingObjectArray.push(loggedUser.following[i].userFollowed);
          }
        }

        return followingObjectArray;
      };

      const following = followingArray();

      // vengono presi tutti i post dell'utente che ha effettuato il login e dei suoi following
      const allPosts = await posts.find({
        $and: [
          {
            $or: [
              { 'username': { $eq: req.user.username } },
              { 'user_id': { $in: following } }
            ]
          },
          {
            created_at: { $gte: oneMonthAgo.toDate() }
          },
          {
            post: new RegExp(req.params.post, 'i')
          }
        ]
      }, {
        comments: 0
      })
        .lean()
        .populate('user_id', {
          'email': 0, 'password': 0, 'posts': 0, 'followers': 0, 'following': 0,
          'notifications': 0, 'chatList': 0, 'images': 0
        })
        .sort({ created_at: -1 })
        .then((posts) => {
          for (let i = 0; i < posts.length; i++) {
            posts[i].is_liked = posts[i].likes.some(like => like.username === req.user.username);
            delete posts[i].likes;
          }

          return posts;
        }).catch(err => {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' });
        });

      console.log(allPosts);

      const top = await posts.find({
        'likes.username': { $eq: req.user.username },
        created_at: { $gte: oneMonthAgo.toDate() },
        post: new RegExp(req.params.post, 'i')
      }, {
        comments: 0,
        likes: 0
      })
        .lean()
        .populate('user_id', {
          'email': 0, 'password': 0, 'posts': 0, 'followers': 0, 'following': 0,
          'notifications': 0, 'chatList': 0, 'images': 0
        })
        .sort({ created_at: -1 })
        .then((posts) => {
          for (let i = 0; i < posts.length; i++) {
            // sono già stati estratti i preferiti, quindi hanno tutti un like da parte dell'utente
            posts[i].is_liked = true;
          }

          return posts;
        }).catch((err) => {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' });
        });

      if (loggedUser.city === '' && loggedUser.country === '') {
        //TODO a cosa serve?
        request('http://geolocation-db.com/json/', { json: true }, async (err, res, body) => {

          await users.updateOne({
            _id: req.user._id
          }, {
            city: body.city,
            country: body.country_name
          });
        });
      }

      res.status(HttpStatus.OK).json({ message: 'All posts', allPosts, top });
    } catch (err) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' });
    }
  },

  async GetAllNewPosts(req, res) {

    let lastDate;
    if (new Date(req.params.created_at) > new Date(1971)){
      lastDate = moment(req.params.created_at).subtract(0, 'days');
    } else {
      lastDate = moment(new Date(0)).subtract(0, 'days');
    }

    try {
      const loggedUser = await users.findOne({
        _id: req.user._id
      }, {
        username: 0,
        email: 0,
        password: 0,
        posts:0,
        followers: 0,
        notifications: 0,
        profileImageId: 0,
        profileImageVersion: 0,
        coverImageId: 0,
        coverImageVersion: 0,
        images: 0,
        city: 0,
        country: 0,
        chatList: 0
      });

      let followingArray = function() {
        let followingObjectArray = [];
        if (typeof loggedUser.following != 'undefined') {
          for (let i = 0; i < loggedUser.following.length; i++) {
            followingObjectArray.push(loggedUser.following[i].userFollowed);
          }
        }

        return followingObjectArray;
      };

      const following = followingArray();

      // vengono presi tutti i post dell'utente che ha effettuato il login e dei suoi following
      const allNewPosts = await posts.find({
        $and: [
          {
            $or: [
              { 'username': { $eq: req.user.username } },
              { 'user_id': { $in: following } }
            ]
          },
          {
            created_at: { $gt: lastDate.toDate() }
          }
        ]
      }, {
        comments: 0,
        likes: 0
      })// non serve che si controllano i like perchè sono nuovi messaggi, quindi non possiamo aver messo like
          .lean()
          .populate('user_id', {'email':0, 'password':0, 'posts':0, 'followers':0, 'following':0,
            'notifications':0, 'chatList':0, 'images':0})
          .sort({ created_at: -1 });

      return res.status(HttpStatus.OK).json({ message: 'All user\'s posts', allNewPosts });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' });
    }
  },

  async GetAllUserPosts(req, res) {

    const today = moment().startOf('day');
    const oneMonthAgo = moment(today).subtract(31, 'days');

    try {
      const userPosts = await posts.find({
        username: req.params.username,
        created_at: { $gte: oneMonthAgo.toDate() }
      }, {
        comments: 0
      })
        .lean() // importantissimo, alrimenti non è possibile cambiare il valore alle chiavi
        .populate('user_id', {'email':0, 'password':0, 'posts':0, 'followers':0, 'following':0,
            'notifications':0, 'chatList':0, 'images':0})
        .sort({ created_at: -1 })
        .then((posts) => {
          for (let i = 0; i < posts.length; i++) {
            /*
            if (posts[i].likes.length > 0 && posts[i].likes.some(like => like.username === req.user.username)) {
              posts[i].likes = true;
            } else {
              posts[i].likes = false;
            }
             */
            posts[i].is_liked = posts[i].likes.some(like => like.username === req.user.username);
            delete posts[i].likes;
          }

          return posts;
        }).catch(err =>
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' })
        );

      return res.status(HttpStatus.OK).json({ message: 'All user\'s posts', userPosts });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' });
    }
    },

  async GetPost(req, res) {
    console.log("non sono usato");
    /*TODO NON USATO
    await posts.findOne({ _id: req.params.id })
      .populate('user_id')
      //.populate('comments.user_id')
      //.sort({ 'comments.created_at': -1 })
      .then((post) => {
        res.status(HttpStatus.OK).json({ message: 'Post Found', post });
      })
      .catch(err =>
        res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'Post Not Found' }));
     */
  },

  AddPost(req, res) {

    const schemaPost = Joi.object().keys({
      post: Joi.string().required()
    });

    const onlyPost = {
      post: req.body.post
    };

    const { error } = Joi.validate(onlyPost, schemaPost);

    if (error && error.details) {
      return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ msg: error.details });
    }

    const body = {
      user_id: req.user._id,
      username: req.user.username,
      post: req.body.post,
      created_at: new Date()
    };

    if (req.body.post && !req.body.image) {

      posts.create(body)
          .then(async post => {
            await users.updateOne({
              _id: req.user._id
            }, {
              $push: {
                posts: {
                  postId: post._id,
                  post: req.body.post,
                  created_at: new Date()
                }
              }
            });

            res.status(HttpStatus.OK).json({ message: 'Post created successfully', post });
          }).catch(err => {
        res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: 'Error occured' });
      });
    }

    if (req.body.post && req.body.image) {

      cloudinary.uploader.upload(req.body.image, async (result) => {

        const reqBody = {
          user_id: req.user._id,
          username: req.user.username,
          post: req.body.post,
          imageVersion: result.version,
          imageId: result.public_id,
          created_at: new Date()
        };

        posts.create(reqBody)
            .then(async post => {
              await users.updateOne({
                    _id: req.user._id
                  }, {
                    $push: {
                      posts: {
                        postId: post._id,
                        post: req.body.post,
                        created_at: new Date()
                      }
                    }
                  }
              );
              res.status(HttpStatus.OK).json({ message: 'Post created successfully', post });
            })
            .catch(err => {
              res
                  .status(HttpStatus.INTERNAL_SERVER_ERROR)
                  .json({ message: 'Error occured' });
            });
      });
    }
  },


  async RemovePost(req, res) {

    const postId = req.params.id;

    await posts.deleteOne({
      _id: postId
    })
      .then(async () => {
        await users.updateOne({
          _id: req.user._id
        }, {
          $pull: {
            posts: {
              postId: req.postId
            }
          }
        }).then(() => {
          return res.status(HttpStatus.OK).json({ message: 'Post removed successfully' });
        }).catch((err) => {
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' });
        });
      })
      .catch((err) => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' });
      });
  },

  async AddLike(req, res) {

    const postId = req.body._id;

    await posts.updateOne({
        _id: postId,
        'likes.username': { $ne: req.user.username }
      },
      {
        $push: {
          likes: {
            username: req.user.username
          }
        },
        $inc: {
          total_likes: 1
        }
      })
      .then(() => {
        return res.status(HttpStatus.OK).json({ message: 'You have liked the post' });
      })
      .catch((err) => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' });
      });
  },

  async RemoveLike(req, res) {

    const postId = req.params.postId;

    await posts.updateOne({
        _id: postId,
        'likes.username': { $eq: req.user.username }
      },
      {
        $pull: {
          likes: {
            username: req.user.username
          }
        },
        $inc: {
          total_likes: -1
        }
      })
      .then(() => {
        return res.status(HttpStatus.OK).json({ message: 'You have unliked the post' });
      })
      .catch((err) => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' });
      });
  },

  async GetAllPostComments(req, res) {

    await posts.findOne(
        { _id: req.params.id },
        {
          user_id: 0,
          username: 0,
          post:0,
          imageVersion:0,
          imageId:0,
          total_likes:0,
          toal_comments: 0,
          likes:0
        })
        .lean()
        .then((post) => {
          let commentsList = [];
          commentsList = post.comments

          res.status(HttpStatus.OK).json({ message: 'Comments List Related to Found Post', commentsList });
        })
        .catch(err =>
            res
                .status(HttpStatus.NOT_FOUND)
                .json({ message: 'Post Not Found' }));
  },

  async AddComment(req, res) {

    const postId = req.body.postId;

    await posts.updateOne({
        _id: postId
      },
      {
        $push: {
          comments: {
            user_id: req.user._id,
            username: req.user.username,
            comment_text: req.body.comment,
            created_at: new Date()
          }
        },
        $inc: {
          total_comments: 1
        }
      })
      .then(() => {
        return res.status(HttpStatus.OK).json({ message: 'You have commented the post' });
      })
      .catch((err) => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' });
      });
  },

  async RemoveComment(req, res) {

    const { postid, commentid } = req.params;

    await posts.updateOne({
        _id: postid
      },
      {
        $pull: {
          comments: {
            _id: commentid
          }
        },
        $inc: {
          total_comments: -1
        }
      })
      .then(() => {
        return res.status(HttpStatus.OK).json({ message: 'You have remove the post successfully' });
      })
      .catch((err) => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' });
      });
  }
};
