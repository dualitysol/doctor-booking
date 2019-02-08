const mongoose = require('mongoose')
const Room = require('../models/room')

module.exports = {
  InsertRooms: (rooms) => {
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
