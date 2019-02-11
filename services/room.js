const mongoose = require('mongoose')
const Room = require('../models/room')
const { ValidateTimesArray } = require('../services/timeManager')

module.exports = {
  InsertRooms: (rooms) => {
    for (let index = 0; index < rooms.length; index++) {
      const room = rooms[index];
      
      if (!Array.isArray(room.times)) room.times = [];

      if (room.times.lenght < 7) {
        for (let i = 0; i < 7 - room.times.lenght; i++) {
          room.times.push(null);
        }
      }

      try {
        ValidateTimesArray(room.times);
      } catch (e) {
        throw e;
      }
    };
    return Room.insertMany(rooms, {
      ordered: false,
      rawResult: true
    })
      .then((result) => {
        return result
      })
      .catch((err) => {
        throw err
      })
  },

  GetAllRooms: () => {
    return Room.find()
      .then(rooms => {
        return rooms
      })
      .catch((err) => {
        return err
      })
  },

}
