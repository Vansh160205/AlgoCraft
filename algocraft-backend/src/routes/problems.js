const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');

router.post('/', problemController.createProblem);
router.get('/', problemController.getAllProblems);
router.put('/:slug', problemController.updateProblem);
router.get('/:slug', problemController.getProblemBySlug);
router.get('/:slug/boilerplate/:language', problemController.getProblemBoilerplate);
module.exports = router;
