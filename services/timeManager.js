const moment = require('moment');
const _ = require('lodash');

const InitTimesByDate = async (currentDate, originalArray) => {
  let weekDay = currentDate.weekday();
  let datedArray = [];

  try {
    const array = await _.cloneDeep(originalArray);
    console.log('zalupa ', originalArray[0].times[0])
    await _.forEach(array, async (item) => {
      let currentDay = item.times[weekDay];
      
      if (currentDay !== null && typeof currentDay !== 'undefined') {
        // console.log('currentDay' ,currentDay)
        const begin = await getHourAndMinute(currentDay.begin);
        const end = await getHourAndMinute(currentDay.end);

        

        currentDay.begin = await currentDate.set({
          hour: begin.hour,
          minute: begin.minute
        }).format();
        currentDay.end = await currentDate.set({
          hour: end.hour,
          minute: end.minute
        }).format();

        // console.log(currentDay)

        datedArray.push({
          _id: item._id,
          name: item.name,
          times: [currentDay]
        });
      }
    });
    return datedArray;
  } catch (error) {
    console.log(error)
  }

  
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

      const end = getHourAndMinute(array[i].times[weekDay].end);

      array[i].times[weekDay].end = moment(interval.end).format();
      array[i].times.push({
        begin: array[i].times[weekDay].end,
        end: moment(interval.end).set({
          hour: end.hour,
          minute: end.minute
        }).format()
      });


    }
  };

  return array;
};

const isLonger = (interval, duration) => {
  if (interval === null) return false;
  // console.log(interval.end, interval.begin)
  // console.log(moment(interval.end).valueOf(), moment(interval.begin).valueOf())
  let intervalDuration = moment(interval.end).valueOf() - moment(interval.begin).valueOf();
  // let intDuration = moment.duration(duration).valueOf();
  return intervalDuration >= duration ? true : false
};

const isIntervalsMatch = (intervalOne, intervalTwo) => {
  // console.log(intervalOne.begin.isSameOrAfter(intervalTwo.begin));
  // console.log(intervalOne.end.isSameOrBefore(intervalTwo.end))
  if (intervalOne.begin.isSameOrAfter(intervalTwo.begin) && intervalOne.end.isSameOrBefore(intervalTwo.end)) {
    return true
  }
  else return false;
}

const FilterByDuration = (array, duration) => {
  for (let i = 0; i < array.length; i++) {
    array[i].times.filter((interval) => isLonger(interval, duration));
  };
  return array.filter((item) => item.length !== 0);
};

const GetMatchedIntervals = (array1, array2) => {
  // console.log(array1)
  let resultIntervals = [];
  for (let i = 0; i < array1.length; i++) {
    for (let j = 0; j < array2.length; j++) {
      for (let n = 0; n < array1[i].times.length; n++) {
        let firstInterval = array1[i].times[n];
        // console.log(firstInterval)
        for (let m = 0; m < array2[j].times[m]; m++) {
          let secondInterval = array2[j].times[m];
          // console.log(firstInterval, secondInterval)
          if (isIntervalsMatch(firstInterval, secondInterval)) resultIntervals.push(firstInterval)
        }
      }
    }
  };

  return resultIntervals;
};

const ValidateTimesArray = (week) => {
  function isInTimeFormat (string) {
    if (string.length > 5 && string.length < 4 && !string.includes(':')) return false;
    let hour = parseInt(string.split(':')[0]);
    let minute = parseInt(string.split(':')[1]);
    if (hour >= 0 && hour < 24 && minute >= 0 && minute <= 60) return true;
    else false;
  };

  if (!Array.isArray(week)) throw new Error('Times should be an array!');
  if (week.length !== 7) throw new Error('Times array length should be 7(its a working week)!');

  for (let i = 0; i < week.length; i++) {
    if (week[i] !== null) {
      if (!Object.getOwnPropertyNames(week[i]).includes('begin') || !Object.getOwnPropertyNames(week[i]).includes('end')) {
        throw new Error('The times object has to be null or object contains fields "begin" and "end"');
      }
      if (typeof week[i].begin !== 'string') throw new Error('"begin" field has to be string!');
      if (!isInTimeFormat(week[i].begin)) throw new Error('"begin" field has to be in data format "HH:MM"!');
      if (typeof week[i].end !== 'string') throw new Error('"end" field has to be string!');
      if (!isInTimeFormat(week[i].end)) throw new Error('"end" field has to be in data format "HH:MM"!');
    }
  }
};

const ValidateTimeAvaliability = (begin, end, item) => {
  console.log(item.times)
  console.log(begin, end)
  let weekDay = moment(new Date(begin)).weekday();
  if (item.times[weekDay] === null) throw new Error('current doctor/room is not avaliable at choosen time!');

  let dayBegin = moment(new Date(begin)).set({
    hour: parseInt(item.times[weekDay].begin.split(':')[0]),
    minute: parseInt(item.times[weekDay].begin.split(':')[1])
  });
  let dayEnd = moment(new Date(begin)).set({
    hour: parseInt(item.times[weekDay].end.split(':')[0]),
    minute: parseInt(item.times[weekDay].end.split(':')[1])
  });
  console.log(!moment(new Date(begin)).isSameOrAfter(dayBegin) && !moment(new Date(end)).isSameOrBefore(dayEnd))

  if (!moment(new Date(begin)).isSameOrAfter(dayBegin) && !moment(new Date(end)).isSameOrBefore(dayEnd)) {
    throw new Error('current doctor/room is not avaliable at choosen time!');
  }
};

const GetIntervals = async (array, dayDate, intervalMap) => {
  let weekDay = moment(dayDate).weekday() - 1;  

  await _.forEach(array, function (item) {
    if (item.times[weekDay] === null || typeof item.times[weekDay] === 'undefined') {
      return;
    } else {
      let itemId = item._id.toString();

      let dayBegin = moment(dayDate).set({
        hour: parseInt(item.times[weekDay].begin.split(':')[0]),
        minute: parseInt(item.times[weekDay].begin.split(':')[1])
      });
      let dayEnd = moment(dayDate).set({
        hour: parseInt(item.times[weekDay].end.split(':')[0]),
        minute: parseInt(item.times[weekDay].end.split(':')[1])
      });

      if(typeof intervalMap.get(itemId) === 'undefined') {
        intervalMap.set(itemId, [{
          begin: dayBegin.format(),
          end: dayEnd.format(),
          duration: dayEnd.valueOf() - dayBegin.valueOf()
        }])
      } else {
        let itemTimes = intervalMap.get(itemId);

        itemTimes.push({
          begin: dayBegin.format(),
          end: dayEnd.format(),
          duration: dayEnd.valueOf() - dayBegin.valueOf()
        });

        intervalMap.set(itemId, itemTimes);
      }
    }
  });
  return intervalMap;
};

const MergeIntervals = async (docIntervals, roomIntervals) => {
  let avaliableDoctorsTimes = [];
  let avaliableRoomsTimes = [];
  let avaliableIntervals = [];

  docIntervals.forEach((interval) => {
    avaliableDoctorsTimes.push(interval);
  });
  roomIntervals.forEach((interval) => {
    avaliableRoomsTimes.push(interval);
  });
  
  avaliableDoctorsTimes = await _.flatten(avaliableDoctorsTimes);
  avaliableRoomsTimes = await _.flatten(avaliableRoomsTimes);

  for (let m = 0; m < avaliableDoctorsTimes.length; m++) {
    let docInterval = avaliableDoctorsTimes[m];

    for (let n = 0; n < avaliableRoomsTimes.length; n++) {
      let roomInterval = avaliableRoomsTimes[n];

      if (moment(docInterval.begin).isSame(roomInterval.begin, 'days')
        && moment(docInterval.begin).isBefore(roomInterval.end)
        && moment(docInterval.end).isAfter(roomInterval.begin)) {

        let avaliableInterval = {};

        moment(docInterval.begin).isSameOrBefore(roomInterval.begin) ? avaliableInterval['begin'] = moment(roomInterval.begin).format() : avaliableInterval['begin'] = moment(docInterval.begin).format();
        moment(docInterval.end).isSameOrAfter(roomInterval.end) ? avaliableInterval['end'] = moment(roomInterval.end).format() : avaliableInterval['end'] = moment(docInterval.end).format();
        
        // avaliableInterval.duration = moment(avaliableInterval.end).valueOf() - moment(avaliableInterval.begin).valueOf();
        avaliableIntervals.push(avaliableInterval);
      }
      
    }
  }

  return avaliableIntervals;
};

module.exports = {
  SplitInterval,
  InitTimesByDate,
  FilterByDuration,
  GetMatchedIntervals,
  ValidateTimesArray,
  ValidateTimeAvaliability,
  GetIntervals,
  MergeIntervals
}
