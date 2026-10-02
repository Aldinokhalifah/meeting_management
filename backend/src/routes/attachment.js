const express = require('express');
const router = express.Router({ mergeParams: true });
const authMiddleware = require('../middleware/auth');
const attachmentController = require('../controllers/attachmentController');

router.use(authMiddleware);

router.post('/presign', attachmentController.requestUpload);
router.post('/:attId/confirm', attachmentController.confirmUpload);
router.get('/', attachmentController.listAttachments);
router.get('/:attId/url', attachmentController.getAttachmentUrl);
router.delete('/:attId', attachmentController.deleteAttachment);

module.exports = router;