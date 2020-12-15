const express = require('express');
const router = express.Router();

const ImagesMiddlewares = require('../controllers/images');
const AuthHelper = require('../helpers/AuthHelper');


// Images List in the Album of Specified User
router.get('/images-list/:username', AuthHelper.VerifyToken, ImagesMiddlewares.GetAllUserImages);

// Get Specified User's Profile Image
router.get('/get-profile-image/:username', AuthHelper.VerifyToken, ImagesMiddlewares.GetUserImageProfile);

// Logged User Upload an Image in His Album
router.post('/upload-image', AuthHelper.VerifyToken, ImagesMiddlewares.UploadUserImage);

// Logged User Set an Image From His Album As User Profile Image
router.get('/set-default-image/:imageId/:imageVersion', AuthHelper.VerifyToken, ImagesMiddlewares.SetUserProfileImage);

// Logged User Set an Image From His Album As User Cover Image
router.get('/set-cover-image/:imageId/:imageVersion', AuthHelper.VerifyToken, ImagesMiddlewares.SetUserCoverImage);


module.exports = router;
