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

// for (let index = 0; index < consultations.length; index++) {
//   const consultation = consultations[index];
//   let begin = new Date(consultation.begin);
//   let end = new Date(consultation.end);
//   const doctor = await Doctor.findOne({ _id: consultation.doctorId }).exec();
//   TimeManager.ValidateTimeAvaliability(begin.toString(), end.toString(), doctor);

//   const room = await Room.findOne({ _id: consultation.roomId }).exec();
//   TimeManager.ValidateTimeAvaliability(begin.toString(), end.toString(), room);
  
// };

module.exports = mongoose.model('Consultation', ConsultationSchema);
