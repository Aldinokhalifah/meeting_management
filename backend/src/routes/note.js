const express = require('express');
const router = express.Router({ mergeParams: true }) ;
const authMiddleware = require('../middleware/auth');
const notesController = require('../controllers/noteController');

router.use(authMiddleware);

router.post('/', notesController.createNote);
router.get('/', notesController.getNote);
router.patch('/', notesController.updateNote);

module.exports = router;