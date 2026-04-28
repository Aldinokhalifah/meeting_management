const express = require('express');
const router = express.Router({ mergeParams: true });
const continuationController = require('../controllers/continuationController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// POST /api/meetings/:id/continue (source_meeting_id dari params)
router.post('/', continuationController.createContinuation);

// GET /api/meetings/:sourceId/continue/:continuationId/previous (continuationId sebagai param)
router.get('/:continuationId/previous', continuationController.getPreviousMeeting);

module.exports = router;