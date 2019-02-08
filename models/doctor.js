const mongoose = require('mongoose');
const { ValidateTimesArray } = require('../services/timeManager');

const DoctorSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: true,
    unique: false,
    index: false
  },
  times:[
    {
      begin: String,
      end: String
    }
  ]
});

DoctorSchema.pre('save', function saveHook(next) {
  const doctor = this;

  if (!doctor.isModified('times')) return next();

  if (!Array.isArray(doctor.times)) doctor.tims = [];

  if (doctor.times.lenght < 7) {
    for (let i = 0; i < 7 - doctor.times.lenght; i++) {
      doctor.times.push(null);
    }
  }

  try {
    ValidateTimesArray(doctor.times);
    return next();
  } catch (e) {
    return next(e);
  }
});

module.exports = mongoose.model('Doctor', DoctorSchema);
