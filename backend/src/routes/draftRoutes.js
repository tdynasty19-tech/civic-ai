const express = require('express');
const { draftController } = require('../controllers/draftController');

const router = express.Router();

router.post('/', draftController);

module.exports = router;
