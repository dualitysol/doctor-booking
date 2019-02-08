const mongoose = require('mongoose');
const Doctor = require('../models/doctor');

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
  let filter = {}
  let begin = moment(from);
  let end = moment(to);
  let stringInterval = end.from(being, true);
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
    const filter = {};

    if (from && to) {
      filter = BuildFilter(from, to);
    }

    return Doctor.find(filter)
      .then(doctors => {
        return doctors
      })
      .catch((err) => {
        return err
      })
  },
}
