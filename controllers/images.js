const cloudinary = require('cloudinary');
const HttpStatus = require('http-status-codes');

const User = require('../models/userModels');

cloudinary.config({
    cloud_name: 'dfn8llckr',
    api_key: '575675419138435',
    api_secret: 'lE_zxe8vYudPLseXYFAJojyyTpc'
});

module.exports = {

    UploadImage(req, res) {
        cloudinary.uploader.upload(req.body.image, async (result) => {
            console.log(result);

            await User.update({
                _id: req.user._id
            }, {
                $push :{
                    images: {
                        imageId: result.public_id,
                        imageVersion: result.version
                    }
                }
            })
                .then(()=>
                res
                    .status(HttpStatus.OK)
                    .json({ message: 'image uploaded successfully'})
                )
                .catch(err =>
                res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .json({ message: 'Error Occured'})
                );
        });
    }
};
