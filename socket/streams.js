const req = require("mongoose");

module.exports = function(io, User, _) {

  const user = new User();
  const global = 'global';

  io.on('connection', (socket) => {

    // il client chiede un refresh e lo riceve privatamente insieme ai suoi follower connessi
    socket.on('refreshPosts', (data) => {
      // la socket viene inviata all'utente stesso che ha effettuato l'azione
      io.to(socket.id).emit('refreshListPosts', {});

      const users = require('../models/userModels');
      // tutti i client in global eccetto la socket che ha effettuato la richiesta
      let global_room = io.sockets.adapter.rooms[global];
      if (typeof(global_room) !== "undefined"){
        // la room esiste ed è presente almeno un utente
        let clients = global_room.sockets;

        users.findOne({ username: socket.username },
            {
              email : 0,
              password: 0,
              posts: 0,
              following: 0,
              notifications: 0,
              chatList: 0,
              profileImageId: 0,
              profileImageVersion: 0,
              coverImageId: 0,
              coverImageVersion: 0,
              images: 0,
              city: 0,
              country: 0
            })
            .populate('followers.follower')
            .then((user) => {
              for (let socketIdKey in clients) {
                if (socketIdKey === socket.id){
                  // è l'utente stesso che ha inviato il messaggio
                  continue;
                }

                let followSocket = io.sockets.connected[socketIdKey];

                if (typeof(followSocket) != 'undefined') {
                  // vengono estratti tutti i follower eventualmente da avvisare (se connessi)
                  for (var i = 0; i < user.followers.length; i++){
                    let usernameFollow = user.followers[i].follower.username;
                    let isFollow = (followSocket.username === usernameFollow);
                    if (isFollow) {
                      io.to(followSocket.id).emit('refreshListPosts', {});
                      // avvisato l'utente viene rimosso dall'array tramite il suo indice
                      user.followers.splice(i, 1);
                      break;
                    }
                  }
                }
              }
            });
      }
    });

    // TODO esempio di socket su remove, non implementata
    socket.on('removePost', (data) => {
      const users = require('../models/userModels');
      // tutti i client in global eccetto la socket che ha effettuato la richiesta
      let global_room = io.sockets.adapter.rooms[global];
      if (typeof(global_room) !== "undefined"){
        // la room esiste ed è presente almeno un utente
        let clients = global_room.sockets;

        users.findOne({ username: socket.username })
            .populate('followers.follower')
            .then((user) => {
              // vengono estratti tutti i follower eventualmente da avvisare (se connessi)
              for (let socketIdKey in clients) {
                if (socketIdKey === socket.id){
                  // è l'utente stesso che ha inviato il messaggio
                  continue;
                }

                let followSocket = io.sockets.connected[socketIdKey];

                if (typeof(followSocket) != 'undefined') {
                  let isFollow = (followSocket.username === user.username);
                  if (isFollow) {
                    io.to(followSocket.id).emit('refreshListRemovePost', {
                      //TODO dati post da rimuovere
                    });
                  }
                }
              }
            });
      }
    });

    socket.on('refresh-posts', (data) => {
      io.to(socket.id).emit('refreshPage', {})
    });

    socket.on('refreshListAfterDeleteComment', (data) => {
      io.to(socket.id).emit('refreshRemovedCommentFromList', {});
    });

    socket.on('refreshListAfterInsertionComment', (data) => {
      io.to(socket.id).emit('refreshAddedCommentToList', {});
    });

    socket.on('refresh', () => {
      io.to(socket.id).emit('refreshPage', {});
    });

    socket.on('online', (data, callback) => {
      socket.username = data.username;

      socket.join(global);

      callback(true);
    });

    socket.on('disconnect', () => {

      const userDisconnected = user.removeUser(socket.id);

      if (userDisconnected){
        const listOnlineUsers = user.getNamesList(userDisconnected.room);
        const distinctListOnlineUsers = _.uniq(listOnlineUsers);
        _.remove(distinctListOnlineUsers, (n) => (n === userDisconnected.userUsername));

        //TODO questo emit verso tutti a cosa serve?
        io.emit('listOnlineUsers', distinctListOnlineUsers);
      }
    });

  });
}
