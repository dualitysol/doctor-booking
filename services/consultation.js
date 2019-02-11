const mongoose = require('mongoose')
const Consultation = require('../models/consultation')
const moment = require('moment')
const TimeManager = require('./timeManager')
const _ = require('lodash');

function excludeConsultations (consultations, doctors, rooms) {
  if (consultations.length === 0) return;
  for (let i = 0; i < consultations.length; i++) {
    TimeManager.SplitInterval(doctors, consultations[i], consultations[i].doctorId);
    TimeManager.SplitInterval(rooms, consultations[i], consultations[i].roomId);
  }
};

async function initWholeInterval (doctors, rooms, interval) {
  let result = {
    doctors: [],
    rooms: []
  };
  


  const start = interval.from;
  const end = moment(interval.to);

  let daysPerPeriod = parseInt(end.diff(start, 'days'));
  for (let i = 0; i < daysPerPeriod; i++) {
    let currentDate = moment(start).add(i, 'days');
    let datedDoctors = await TimeManager.InitTimesByDate(currentDate, doctors);
    if (datedDoctors.length > 0) result.doctors.push(datedDoctors);
    let datedRooms = await TimeManager.InitTimesByDate(currentDate, rooms);
    if (datedRooms.length > 0) result.rooms.push(datedRooms);
  };

  result.doctors = _.flatten(result.doctors);
  result.rooms = _.flatten(result.rooms);

  return result;
}

module.exports = {
  InsertConsultations: (consultations) => {
    return Consultation.insertMany(consultations, {
      ordered: false,
      rawResult: true
    })
      .then((result) => {
        console.log(result);
        return result
      })
      .catch((err) => {
        throw err
      })
  },

  GetAllConsultations: () => {
    return Consultation.find()
      .then(consultations => {
        return consultations
      })
      .catch((err) => {
        return err
      })
  },

  GetBusyItervals: (from, to) => {
    return Consultation.findByIterval(from, to)
      .then((consultations) => {
        return consultations;
      })
      .catch((err) => {
        return err;
      });
  },

  GetAvaliableIntervals: (consultations, doctors, rooms, options) => {
    let datedCollections = initWholeInterval(doctors, rooms, options);
    excludeConsultations(consultations, datedCollections.doctors, datedCollections.rooms);
    TimeManager.FilterByDuration(datedCollections.doctors, options.duration)
    TimeManager.FilterByDuration(datedCollections.rooms, options.duration)
    return TimeManager.GetMatchedIntervals(datedCollections.doctors, datedCollections.rooms);
  }

}
