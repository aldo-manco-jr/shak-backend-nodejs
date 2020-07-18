const posts = require('../models/postModels')

module.exports = {

    AddPost(req, res) {

        const schemaPost = Joi.objects.keys({
           post: Joi.string().required()
        });

        const {error} = Joi.validate(req.body, schemaPost);

        if (error && error.details){
            return res.status(HttpStatus.BAD_REQUEST).json({message: error.details})
        }



    }
};
