const jwt = require('jsonwebtoken');
const HttpStatus = require('http-status-codes');
const dbConfig = require('../config/secret');

module.exports = {
    VerifyToken: (req, res, next) => {
        const token = req.cookies.auth;

        if (!token) {
            return res
                .status(HttpStatus.FORBIDDEN)
                .json({message: 'No token provided'});
        }

        return jwt.verify(token, dbConfig.secret, (err, decoded) => {
            if (err) {

                if (err.expiredAt < new Date()) {
                    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                        message: 'Token has expired, please login again',
                        token: null
                    });
                }
                next();
            }
            req.user = decoded.data;
            next();
        });
    }
}
