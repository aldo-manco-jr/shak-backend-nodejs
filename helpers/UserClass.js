class User {

  constructor() {
    this.globalArray = [];
  }

  enterRoom(socketId, userUsername, room){

    const user = {
      socketId: socketId,
      userUsername: userUsername,
      room: room
    }

    this.globalArray.push(user);
    return user;
  }

  getUserId(socketId){
    const user = this.globalArray.filter((user) => (user.socketId === socketId))[0];
    return user;
  }

  removeUser(socketId){

    const userDisconnected = this.getUserId(socketId);

    if (userDisconnected){
      this.globalArray = this.globalArray.filter((user) => (user.id !== userDisconnected));
    }

    return userDisconnected;
  }

  getNamesList(room){

    const arrayCurrentRoom = this.globalArray.filter((user) => (user.room === room));
    const arrayNames = arrayCurrentRoom.map(user => user.userUsername);

    return arrayNames;
  }

}

module.exports = { User };
