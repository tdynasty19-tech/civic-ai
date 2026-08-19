const express = require('express');
const { schemeController } = require('../controllers/schemeController');

const router = express.Router();

router.post('/', schemeController);

module.exports = router;
