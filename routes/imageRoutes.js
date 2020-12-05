const express = require('express');
const router = express.Router();

const ImageCtrl = require('../controllers/images');
const AuthHelper = require('../helpers/AuthHelper');

router.post('/upload-image', AuthHelper.VerifyToken, ImageCtrl.UploadImage);
router.get('/set-default-image/:imageId/:imageVersion', AuthHelper.VerifyToken, ImageCtrl.SetDefaultImage);
router.get('/set-cover-image/:imageId/:imageVersion', AuthHelper.VerifyToken, ImageCtrl.SetDefaultCoverImage);

module.exports = router;
