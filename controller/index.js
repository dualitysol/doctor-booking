const doctorService = require('../services/doctor');
const roomService = require('../services/room');
const consultationService = require('../services/consultation');

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
        error: e.toString()
      })
    });
};

exports.GetAvaliableIntervals = async (req, res, next) => {
  const options = {
    duration: req.query.duration,
    from: req.query.begin,
    to: req.query.end
  };

  if (!options.from || !options.to || !options.duration) res.status(400).json({ message: 'Prodive query parameter "from", "to", "duration"'});

  try {
    const consultations = await consultationService.GetBusyItervals(options.from, options.to);
    const doctors = await doctorService.GetAllDoctors(options.from, options.to);
    const rooms = await roomService.GetAllRooms();
    const avaliableIntervals = consultationService.GetAvaliableIntervals(consultations, doctors, rooms, options);

    if (Array.isArray(avaliableIntervals) && avaliableIntervals.length !== 0) res.status(200).json(avaliableIntervals)
    else res.status(404).json({
      message: 'Unfortunely, there are no avaliable intervals'
    })
  } catch (e) {
    console.log(e);
    console.log('Error getting intervals');

    res.status(500).json({
      message: 'Error getting intervals',
      error: e.toString()
    })
  }
}
