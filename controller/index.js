const doctorService = require('../services/doctor');
const roomService = require('../services/room');
const consultationService = require('../services/consultation');
const timeManager = require('../services/timeManager');
const moment = require('moment');
const _ = require('lodash');

exports.GetResources = async (req, res, next) => {
  try {
    const doctors = await doctorService.GetAllDoctors();
    const rooms = await roomService.GetAllRooms();

    if (doctors.length === 0 && rooms.length === 0) res.status(404).json({ message: 'There are no doctors/rooms yet!'});
    else res.status(200).json({
      doctors,
      rooms
    });
  } catch (e) {
    console.log(e);
    console.log('Error getting all doctors/rooms');

    res.status(500).json({
      message: 'Error getting all doctors/rooms',
      error: e.toString()
    });
  }
};

exports.PostResources = async (req, res, next) => {
  try {
    if (!req.body.doctors) throw new Error('Provide doctors array!');
    if (!req.body.rooms) throw new Error('Provide rooms array!');

    const doctors = req.body.doctors;
    const rooms = req.body.rooms;

    let result = {};

    result.doctors = await doctorService.InsertDoctors(doctors);
    result.rooms = await roomService.InsertRooms(rooms);

    res.status(201).json(result);
  } catch (e) {
    console.log(e);
    console.log('Error inserting doctors/rooms');

    res.status(500).json({
      message: 'Sorry something went wrong while inserting doctors/rooms',
      error: e.toString()
    })
  }
};

exports.GetConsultations = async (req, res, next) => {
  return consultationService.GetAllConsultations()
    .then((consultations) => {
      // if (consultations.length === 0) res.status(404).json({ message: 'There are no consultations yet'})
      res.status(200).json(consultations);
    })
    .catch((err) => {
      console.log(err);
      console.log('Error getting consultations');

      res.status(500).json({
        message: 'Oops! Something went wrong while getting consultations',
        error: e.toString()
      })
    })
};

exports.PostConsultations = async (req, res, next) => {
  const consultations = req.body.consultations;

  if (!consultations || !Array.isArray(consultations) || consultations.lenght < 1) res.status(400).json({ message: 'Provide consultations array!' });

  return consultationService.InsertConsultations(consultations)
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((err) => {
      console.log(err);
      console.log('Error inserting consultations');

      res.status(500).json({
        message: 'Error inserting consultations',
        error: err.toString()
      })
    });
};

exports.GetAvaliableIntervals = async (req, res, next) => {
  if (!req.query.begin || !req.query.end || !req.query.duration) {
    res.status(400).json({ message: 'Prodive query parameter "begin", "end", "duration"'});
  }

  const options = {
    duration: parseInt(req.query.duration),
    from: new Date(req.query.begin),
    to: new Date(req.query.end)
  };

  try {
    const consultations = await consultationService.GetBusyItervals(options.from, options.to);
    const doctors = await doctorService.GetAllDoctors(options.from, options.to);
    const rooms = await roomService.GetAllRooms();

    const begin = moment(options.from);
    const end = moment(options.to);
    const daysAmount = parseInt(end.diff(begin, 'days'));

    let docIntervals = new Map();
    let roomIntervals = new Map();

    for (let i = 0; i < daysAmount; i++) {
      let currentDay = moment(begin).add(i, 'days');

      docIntervals = await timeManager.GetIntervals(doctors, currentDay, docIntervals);
      roomIntervals = await timeManager.GetIntervals(rooms, currentDay, roomIntervals); 
    };

    async function Split (consultation, docIntervals, roomIntervals) {
      let docTimes = docIntervals.get(consultation.doctorId.toString());
      let roomTimes = roomIntervals.get(consultation.roomId.toString());

      let newAvaliableTimeDoctor = [];

      async function SplitOnMap (times) {
        let matchedInterval = await times.find(function (interval) {
          return moment(consultation.begin).isSame(interval.begin, 'days');
        });
    
        if (typeof matchedInterval !== 'undefined') {
          let matchedIntervalEnd = moment(matchedInterval.end).format();
          matchedInterval.end = moment(consultation.begin).format();
          matchedInterval.duration = moment(consultation.begin).valueOf() - moment(matchedInterval.begin).valueOf()

          newAvaliableTimeDoctor.push(matchedInterval);
          newAvaliableTimeDoctor.push({
            begin: moment(consultation.end).format(),
            end: moment(matchedIntervalEnd).format(),
            duration: moment(matchedIntervalEnd).valueOf() - moment(consultation.end).valueOf()
          });
        };
    
        times.splice(times.indexOf(matchedInterval), 1);

        return _.concat(times, newAvaliableTimeDoctor);
      };

      docTimes = await SplitOnMap(docTimes);
      roomTimes = await SplitOnMap(roomTimes);

      docIntervals.set(consultation.doctorId.toString(), docTimes);
      roomIntervals.set(consultation.roomId.toString(), roomTimes);
    }

    async function ExcludeConsultations (consultations) {   
      for (let index in consultations) {
        const consultation = consultations[index];

        await Split(consultation, docIntervals, roomIntervals);
      }
    }

    await ExcludeConsultations(consultations);

    let avaliableIntervals = await timeManager.MergeIntervals(docIntervals, roomIntervals);

    res.status(200).json(avaliableIntervals);
  } catch (error) {
    res.status(500).json({
      message: 'Cannot get avaliable booking period',
      error: error
    })
  }
};
