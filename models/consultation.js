const mongoose = require('mongoose');
const Doctor = require('./doctor'); // require it only for validation
const Room = require('./room'); // require it only for validation
const { ValidateTimeAvaliability } = require('../services/timeManager');

const ConsultationSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'doctor'
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'room'
  },
  begin: {
    type: Date,
    required: true
  },
  end: {
    type: Date,
    required: true
  }
});

ConsultationSchema.statics.findByIterval = function (from, to, cb) {
  return this.find({
    begin: {
      $gte: from
    },
    end: {
      $lte: to
    }
  }, cb)
};

ConsultationSchema.pre('save', async function saveHook(next) {
  try {
    const doctor = await Doctor.findOne({ _id: this.doctorId }).exec();
    ValidateTimeAvaliability(this.times, doctor);

    const room = await Room.findOne({ _id: this.roomId }).exec();
    ValidateTimeAvaliability(this.times, room);
    return next();
  } catch (e) {
    return next(e);
  }
});

module.exports = mongoose.model('Consultation', ConsultationSchema);
