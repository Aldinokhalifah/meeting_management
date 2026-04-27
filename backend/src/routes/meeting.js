const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', meetingController.createMeeting);
router.get('/', meetingController.getMeetings);
router.get('/:id', meetingController.getMeetingDetail);
router.patch('/:id', meetingController.updateMeeting);
router.delete('/:id', meetingController.deleteMeeting);

router.post('/:id/participants', meetingController.addParticipant);
router.delete('/:id/participants/:userId', meetingController.removeParticipant);

module.exports = router;