const express = require('express');
const router = express.Router({ mergeParams: true });
const actionItemsController = require('../controllers/actionItemController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', actionItemsController.createActionItem);
router.get('/', actionItemsController.getActionItems);
router.patch('/:itemId', actionItemsController.updateActionItem);
router.delete('/:itemId', actionItemsController.deleteActionItem);

module.exports = router;