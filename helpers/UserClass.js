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
    const user = this.globalArray.filter((tmp) => (tmp.socketId === socketId))[0];
    return user;
  }

  removeUser(socketId){

    const userDisconnected = this.getUserId(socketId);

    if (userDisconnected){
      this.globalArray = this.globalArray.filter((tmp) => (tmp.socketId !== userDisconnected));
    }

    return userDisconnected;
  }

  getNamesList(room){

    const arrayCurrentRoom = this.globalArray.filter((tmp) => (tmp.room === room));
    const arrayNames = arrayCurrentRoom.map((tmp) => (tmp.userUsername));

    return arrayNames;
  }

}

module.exports = { User };
