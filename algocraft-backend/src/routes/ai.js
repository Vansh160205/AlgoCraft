const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/generateComplexiety', aiController.generateCompleiety);
module.exports = router;
