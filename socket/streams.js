
module.exports = function(io, User, _) {

  const user = new User();

  io.on('connection', (socket) => {

    socket.on('refresh', (data) => {
      io.emit('refreshPage', {});
    });

    socket.on('online', (data) => {
      socket.join(data.room);
      user.enterRoom(socket.id, data.userUsername, data.room);

      const listOnlineUsers = user.getNamesList(data.room);

      io.emit('listOnlineUsers', _.uniq(listOnlineUsers));
    });

    socket.on('disconnect', () => {

      const userDisconnected = user.removeUser(socket.id);

      if (userDisconnected){
        const listOnlineUsers = user.getNamesList(userDisconnected.room);
        const distinctListOnlineUsers = _.uniq(listOnlineUsers);
        _.remove(distinctListOnlineUsers, (n) => (n === userDisconnected.userUsername));

        io.emit('listOnlineUsers', distinctListOnlineUsers);
      }
    });

  });
}
