const mongoose = require('mongoose');
const Doctor = require('../models/doctor');
const moment = require('moment');
const { ValidateTimesArray } = require('../services/timeManager');

function FilterDaysFrom(filter, from) {
  filter[`times.${weekDayFrom}`]['$gte'] = new Date(from);
}

function isLessThenWeek (string) {
  function IsDays(string) {
    string === 'days' || string === 'day' ? true : false
  };
  function notMoreThenSeven (string) {
    parseInt(string) <= 7 ? true : false
  };
  string.split(' ');
  if (string.length === 1 && IsDays(string[1]) && notMoreThenSeven(string[0])) return true;
  else return false;
};

function BuildFilter (from, to) {
  let filter = {};
  let begin = moment(from).format();
  let end = moment(to).format();
  console.log(end);
  let stringInterval = end.diff(begin, 'days');
  if (isLessThenWeek(stringInterval)) {
    let weekDayFrom = moment(from).weekday();
    let weekDayTo = moment(to).weekday();
    filter[`times.${weekDayFrom}`]['$gte'] = new Date(from);
    filter[`times.${weekDayTo}`]['$lte'] = new Date(to);

  };
  return filter;
};

module.exports = {
  InsertDoctors: (doctors) => {
    for (let index = 0; index < doctors.length; index++) {
      const doctor = doctors[index];
      
      if (!Array.isArray(doctor.times)) doctor.times = [];

      if (doctor.times.lenght < 7) {
        for (let i = 0; i < 7 - doctor.times.lenght; i++) {
          doctor.times.push(null);
        }
      }

      try {
        ValidateTimesArray(doctor.times);
      } catch (e) {
        throw e;
      }
    };
    return Doctor.insertMany(doctors, {
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

  GetAllDoctors: (from, to) => {
    let filter = {};

    // if (from && to) {
    //   filter = BuildFilter(from, to);
    // }

    return Doctor.find(filter)
      .then(doctors => {
        return doctors
      })
      .catch((err) => {
        return err
      })
  },
}
