const express = require('express');
const router = express.Router();
const submissionsController = require('../controllers/submissionsController');
const auth=require('../middleware/auth')

router.post('/',auth,submissionsController.createSubmission);

module.exports = router;
