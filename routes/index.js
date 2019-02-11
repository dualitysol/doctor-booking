const express = require('express');
const router = express.Router();
const Controller = require('../controller');

router.get('/resources', Controller.GetResources);

router.post('/resources', Controller.PostResources);

router.get('/consultations', Controller.GetConsultations);

router.post('/consultations', Controller.PostConsultations);

router.get('/availability', Controller.GetAvaliableIntervals);

module.exports = router
