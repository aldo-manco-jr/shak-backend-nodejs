const express = require('express');
const router = express.Router();

const ImagesMiddlewares = require('../controllers/images');
const AuthHelper = require('../helpers/AuthHelper');


// Images List in the Album of Specified User
router.get('/image/list/:username', AuthHelper.VerifyToken, ImagesMiddlewares.GetAllUserImages);

// Get Specified User's Profile Image
router.get('/image/profile/:username', AuthHelper.VerifyToken, ImagesMiddlewares.GetUserImageProfile);

// Logged User Upload an Image in His Album
router.post('/image', AuthHelper.VerifyToken, ImagesMiddlewares.UploadUserImage);

// Logged User Set an Image From His Album As User Profile Image
router.put('/image/profile/:imageId/:imageVersion', AuthHelper.VerifyToken, ImagesMiddlewares.SetUserProfileImage);

// Logged User Set an Image From His Album As User Cover Image
router.put('/image/cover/:imageId/:imageVersion', AuthHelper.VerifyToken, ImagesMiddlewares.SetUserCoverImage);


module.exports = router;
