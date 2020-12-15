const cloudinary = require('cloudinary');
const HttpStatus = require('http-status-codes');

const User = require('../models/userModels');

cloudinary.config({
  cloud_name: 'dfn8llckr',
  api_key: '575675419138435',
  api_secret: 'lE_zxe8vYudPLseXYFAJojyyTpc'
});

module.exports = {

  async GetAllUserImages(req, res) {

    await User.findOne({ username: req.params.username })
      .then((user) => {

        let imagesExtractFunction = function() {
          let imagesList = [];
          if (typeof user.images != 'undefined') {
            for (let i = 0; i < user.images.length; i++) {
              imagesList.push(user.images[i]);
            }
          }
          return imagesList;
        };

        let imagesList = imagesExtractFunction();

        return res.status(HttpStatus.OK).json({ message: 'Get all user\'s images list', imagesList });
      })
      .catch((error) => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.details });
      });
  },

  async GetUserImageProfile(req, res) {

    await User.findOne({ username: req.params.username })
      .then((user) => {

        let userProfileImageId = user.profileImageId;
        let userProfileImageVersion = user.profileImageVersion;

        return res.status(HttpStatus.OK).json({ message: 'Get user\'s profile image', userProfileImageId, userProfileImageVersion });
      })
      .catch((error) => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.details });
      });
  },

  UploadUserImage(req, res) {

    cloudinary.uploader.upload(req.body.image, async (result) => {

      await User.update({
        _id: req.user._id
      }, {
        $push: {
          images: {
            imageId: result.public_id,
            imageVersion: result.version
          }
        }
      })
        .then(() =>
          res
            .status(HttpStatus.OK)
            .json({ message: 'image uploaded successfully' })
        )
        .catch(err =>
          res.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: 'Error Occured' })
        );
    });
  },

  async SetUserProfileImage(req, res) {

    const { imageId, imageVersion } = req.params;

    await User.update({
      _id: req.user._id
    }, {
      profileImageId: imageId,
      profileImageVersion: imageVersion
    })
      .then(() =>
        res
          .status(HttpStatus.OK)
          .json({ message: 'image uploaded successfully' })
      )
      .catch(err =>
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error Occured' })
      );
  },

  async SetUserCoverImage(req, res) {

    const { imageId, imageVersion } = req.params;

    await User.update({
      _id: req.user._id
    }, {
      coverImageId: imageId,
      coverImageVersion: imageVersion
    })
      .then(() =>
        res
          .status(HttpStatus.OK)
          .json({ message: 'image uploaded successfully' })
      )
      .catch(err =>
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error Occured' })
      );
  }
};
