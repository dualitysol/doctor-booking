const mongoose = require('mongoose');
const { ValidateTimesArray } = require('../services/timeManager');

const DoctorSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: true,
    unique: true,
  },
  times:[
    {
      begin: String,
      end: String
    }
  ]
});

module.exports = mongoose.model('Doctor', DoctorSchema);
