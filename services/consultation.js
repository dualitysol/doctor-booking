const mongoose = require('mongoose')
const Consultation = require('../models/consultation')
const moment = require('moment')
const TimeManager = require('./timeManager')

// function SplitInterval (array, interval, id) {
//   let weekDay = moment(interval.begin).weekday();
//   for(let i = 0; i < array.length; i += 1) {
//     if(array[i]['_id'] === id) {
//       let beginHour = parseInt(array[i].times[weekDay].begin.split(':')[0]);
//       let beginMinute = parseInt(array[i].times[weekDay].begin.split(':')[1]);
//       let endHour = parseInt(array[i].times[weekDay].end.split(':')[0]);
//       let endMinute = parseInt(array[i].times[weekDay].end.split(':')[1]);
//
//       array[i].times[weekDay] = {
//         begin: moment(interval.begin).set({
//           hour: beginHour,
//           minute: beginMinute
//         }).toDate(),
//         end: moment(interval.end).toDate()
//       };
//
//       array[i].times.push({
//         end: moment(interval.begin).set({
//           hour: endHour,
//           minute: endMinute
//         }).toDate(),
//         end: moment(interval.begin).toDate()
//       });
//
//
//     }
//   };
//   return array;
// };

function excludeConsultations (consultations, doctors, rooms) {
  for (let i = 0; i < consultations.length; i++) {
    TimeManager.SplitInterval(doctors, consultations[i], consultations[i].doctorId);
    TimeManager.SplitInterval(rooms, consultations[i], consultations[i].roomId);
    // FilterIntervals(doctorsInterval, roomsInterval);
  }
};

// function initTimesByDate (currentDate, array) {
//   let weekDay = currentDate.weekday();
//   let datedArray = array.map((item) => {
//     let currentDay = item.times[weekDay];
//
//     if (currentDay !== null) {
//       let beginHour = parseInt(item.times[weekDay].begin.split(':')[0]);
//       let beginMinute = parseInt(item.times[weekDay].begin.split(':')[1]);
//       let endHour = parseInt(item.times[weekDay].end.split(':')[0]);
//       let endMinute = parseInt(item.times[weekDay].end.split(':')[1]);
//
//       currentDay.begin = currentDate.set({
//         hour: beginHour,
//         minute: beginMinute
//       }).toDate();
//       currentDay.end = currentDate.set({
//         hour: endHour,
//         minute: endMinute
//       }).toDate();
//
//       return item;
//     }
//   });
//   return datedArray;
// };

function initWholeInterval (doctors, rooms, interval) {
  let result = {
    doctors: [],
    rooms: []
  };

  const start = moment(interval.from).format();
  const end = moment(interval.to).format();

  let daysPerPeriod = parseInt(start.diff(end, 'days'));

  for (let i = 0; i < daysPerPeriod; i++) {
    let currentDate = start.add(i, 'days');

    result.doctors.push(TimeManager.InitTimesByDate(currentDate, doctors));
    result.rooms.push(TimeManager.InitTimesByDate(currentDate, rooms));
  };

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
    initWholeInterval(doctors, rooms, options);
    excludeConsultations(consultations, doctors, rooms);
    TimeManager.FilterByDuration(doctors, options.duration)
    TimeManager.FilterByDuration(rooms, options.duration)
    return TimeManager.GetMatchedIntervals(doctors, rooms);
  }

}
