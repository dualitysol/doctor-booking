const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: true,
    unique: true
  },
  times:[
    {
      begin: {
        type: String
      },
      end: {
        type: String
      }
    }
  ]
});

module.exports = mongoose.model('Room', RoomSchema);
