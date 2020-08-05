const User = require('../models/userModels');

module.exports = {

    firstLetterUppercase: (username) => {
        const name = username.toLowerCase();
        return name.charAt(0).toUpperCase() + name.slice(1);
    },

    lowerCase: (str) => {
        return str.toLowerCase();
    },

    updateChatList: async(req, message) => {

        await User.update({
            _id: req.user._id
        },{
            $pull:{
                chatList:{
                    receiverId: req.params.receiverId
                }
            }
        });

        await User.update({
            _id: req.params.receiverId
        }, {
            $pull:{
                chatList: {
                    receiverId:  req.user._id
                }
            }
        });

        await User.updateOne({
                _id: req.user._id
            }, {
                $push: {
                    chatList: {
                        $each: [
                            {
                                receiverId: req.params.receiverId,
                                msgId: message._id
                            }
                        ],
                        $position: 0
                    }
                }
            }
        );

        await User.updateOne({
                _id: req.params.receiverId
            }, {
                $push: {
                    chatList: {
                        $each: [
                            {
                                receiverId: req.user._id,
                                msgId: message._id
                            }
                        ],
                        $position: 0
                    }
                }
            }
        );
    }
};
