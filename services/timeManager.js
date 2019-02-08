const moment = require('moment');

const InitTimesByDate = (currentDate, array) => {
  let weekDay = currentDate.weekday();
  let datedArray = array.map((item) => {
    let currentDay = item.times[weekDay];

    if (currentDay !== null) {
      const { beginHour, beginMinute } = getHourAndMinute(array[i].times[weekDay].begin);
      const { endHour, endMinute } = getHourAndMinute(array[i].times[weekDay].end);

      currentDay.begin = currentDate.set({
        hour: beginHour,
        minute: beginMinute
      }).toDate();
      currentDay.end = currentDate.set({
        hour: endHour,
        minute: endMinute
      }).toDate();

      return item;
    }
  });
  return datedArray;
};

const getHourAndMinute = (timeString) => {
  let hour = parseInt(timeString.split(':')[0]);
  let minute = parseInt(timeString.split(':')[1]);
  return { hour, minute };
}

const SplitInterval = (array, interval, id) => {
  let weekDay = moment(interval.begin).weekday();
  for(let i = 0; i < array.length; i += 1) {
    if(array[i]['_id'] === id) {
      // let beginHour = parseInt(array[i].times[weekDay].begin.split(':')[0]);
      // let beginMinute = parseInt(array[i].times[weekDay].begin.split(':')[1]);
      // let endHour = parseInt(array[i].times[weekDay].end.split(':')[0]);
      // let endMinute = parseInt(array[i].times[weekDay].end.split(':')[1]);

      // const { beginHour, beginMinute } = getHourAndMinute(array[i].times[weekDay].begin);
      const { endHour, endMinute } = getHourAndMinute(array[i].times[weekDay].end);

      // array[i].times[weekDay] = {
      //   begin: moment(interval.begin).set({
      //     hour: beginHour,
      //     minute: beginMinute
      //   }).toDate(),
      //   end: moment(interval.end).toDate()
      // };

      array[i].times[weekDay].end = moment(interval.end).toDate();

      array[i].times.push({
        begin: array[i].times[weekDay].end,
        end: moment(interval.end).set({
          hour: endHour,
          minute: endMinute
        }).toDate()
      });


    }
  };
  return array;
};

const isLonger = (interval, duration) => {
  let intervalDuration = interval.begin.valueOf() - interval.end.valueOf();
  let intDuration = moment.duration(duration).valueOf();
  return intervalDuration >= intDuration ? true : false
};

const isIntervalsMatch = (intervalOne, intervalTwo) => {
  if (intervalOne.begin.isSameOrAfter(intervalTwo.begin) && intervalOne.end.isSameOrBefore(intervalTwo.end)) {
    return true
  }
  else return false;
}

const FilterByDuration = (array, duration) => {
  for (let i = 0; i < array.length; i++) {
    array[i].times.filter((interval) => isLongerDuration(interval, duration));
  };
  return array.filter((item) => item.length !== 0);
};

const GetMatchedIntervals = (array1, array2) => {
  let resultIntervals = [];
  for (let i = 0; i < array1.length; i++) {
    for (let j = 0; j < array2.length; j++) {
      for (let n = 0; n < array1[i].times.length; n++) {
        let firstInterval = array1[i].times[n];

        for (let m = 0; m < array2[j].times[m]; m++) {
          let secondInterval = array2[j].times[m];

          if (isIntervalsMatch(firstInterval, secondInterval)) resultIntervals.push(firstInterval)
        }
      }
    }
  };

  return resultIntervals;
};

const ValidateTimesArray = (week) => {
  function isInTimeFormat (string) {
    if (string.length !== 5 && !string.includes(':')) return false;
    let hour = parseInt(string.split(':')[0]);
    let minute = parseInt(string.split(':')[1]);
    if (hour >= 0 && hour < 24 && minute >= 0 && minute <= 60) return true;
    else false;
  };

  if (!Array.isArray(week)) throw new Error('Times should be an array!');
  if (week.length !== 7) throw new Error('Times array length should be 7(its a working week)!');

  for (let i = 0; i < week.length; i++) {
    if (week[i] !== null) {
      if (!Object.getOwnPropertyNames(obj).includes('begin') || !Object.getOwnPropertyNames(obj).includes('end')) {
        throw new Error('The times object has to be null or object contains fields "begin" and "end"');
      }
      if (typeof week[i].begin !== 'string') throw new Error('"begin" field has to be string!');
      if (!isInTimeFormat(week[i].begin)) throw new Error('"begin" field has to be in data format "HH:MM"!');
      if (typeof week[i].end !== 'string') throw new Error('"end" field has to be string!');
      if (!isInTimeFormat(week[i].end)) throw new Error('"end" field has to be in data format "HH:MM"!');
    } else throw new Error('The times object has to be null or object contains fields "begin" and "end"');
  }
};

const ValidateTimeAvaliability = (begin, end, instance) => {
  let weekDay = moment(begin).weekday();
  if (instance.times[weekDay] === null) throw new Error('current doctor/room is not avaliable at choosen time!');
  if (!moment(begin).isSameOrAfter(instance.times[weekDay].begin) && !moment(begin).isSameOrBefore(instance.times[weekDay].end)) {
    throw new Error('current doctor/room is not avaliable at choosen time!');
  }
}

module.exports = {
  SplitInterval,
  InitTimesByDate,
  FilterByDuration,
  GetMatchedIntervals,
  ValidateTimesArray,
  ValidateTimeAvaliability
}
