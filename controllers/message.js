const HttpStatus = require('http-status-codes');
const Conversation = require('../models/conversationModels');
const Message = require('../models/messageModels');
const User = require('../models/userModels');

module.exports = {

  SendMessage(req, res) {

    const { senderId, receiverId } = req.params;

    Conversation.find(
      {
        $or:
          [
            {
              partecipants: {
                $elemMatch: { senderId: senderId, receiverId: receiverId }
              }
            },
            {
              partecipants: {
                $elemMatch: { senderId: receiverId, receiverId: senderId }
              }
            }
          ]
      },
      async (err, result) => {

        if (result.length > 0) {

          await Message.updateOne({
              conversationId: result[0]._id
            }, {
              $push: {
                message: {
                  senderId: req.user._id,
                  receiverId: req.params.receiverId,
                  senderName: req.user.username,
                  receiverName: req.body.receiverName,
                  body: req.body.message
                }
              }
            }
          ).then(() => {
            res.status(HttpStatus.OK).json({ message: 'Message Sent' });
          })
            .catch((err) => {
              res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' });
            });


        } else {

          const newConversation = new Conversation();
          newConversation.partecipants.push({ senderId: req.user._id, receiverId: req.params.receiverId });

          const saveConversation = await newConversation.save();
          console.log(saveConversation);

          const newMessage = new Message();
          newMessage.conversationId = saveConversation._id;
          newMessage.sender = req.user.username;
          newMessage.receiver = req.body.receiverName;
          newMessage.message.push({
            senderId: req.user._id,
            senderName: req.user.username,
            receiverName: req.body.receiverName,
            body: req.body.message
          });

          await newMessage.save()
            .then(() => {
              res.status(HttpStatus.OK).json({ message: 'Message Sent' });
            })
            .catch((err) => {
              res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error occured' });
            });

          await User.updateOne({
              _id: req.user._id
            }, {
              $push: {
                chatList: {
                  $each: [
                    {
                      receiverId: req.params.receiverId,
                      msgId: newMessage._id
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
                      msgId: newMessage._id
                    }
                  ],
                  $position: 0
                }
              }
            }
          );
        }
      }
    );
  },

  async GetAllMessages(req, res) {

    const { senderId, receiverId } = req.params;

    const conversation = await Conversation.findOne({
      $or: [
        {
          $and: [
            { 'partecipants.senderId': senderId },
            { 'partecipants.receiverId': receiverId }
          ]
        },
        {
          $and: [
            { 'partecipants.senderId': receiverId },
            { 'partecipants.receiverId': senderId }
          ]
        }
      ]
    }).select('_id');

    if (conversation) {

      const messages = await Message.findOne({
        conversationId: conversation._id
      });

      res.status(HttpStatus.OK).json({ message: 'Messages Found', messages });
    }
  }

};
