const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const waController = require('../controllers/waController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', meetingController.createMeeting);
router.get('/', meetingController.getMeetings);
router.get('/:id', meetingController.getMeetingDetail);
router.patch('/:id', meetingController.updateMeeting);
router.delete('/:id', meetingController.deleteMeeting);

router.post('/:id/participants', meetingController.addParticipant);
router.patch('/:id/participants/:userId', meetingController.updateParticipantRole);
router.delete('/:id/participants/:userId', meetingController.removeParticipant);

// router.post('/:id/whatsapp/invitation', waController.sendInvitation);
// router.post('/:id/whatsapp/summary', waController.sendMeetingSummary);

module.exports = router;