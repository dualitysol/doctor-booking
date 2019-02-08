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

RoomSchema.pre('save', function saveHook(next) {
  const room = this;

  if (!room.isModified('times')) return next();

  if (!Array.isArray(rooms.times)) room.tims = [];

  if (room.times.lenght < 7) {
    for (let i = 0; i < 7 - room.times.lenght; i++) {
      room.times.push(null);
    }
  }

  try {
    ValidateTimesArray(room.times);
    return next();
  } catch (e) {
    return next(e);
  }
});

module.exports = mongoose.model('Room', RoomSchema);
