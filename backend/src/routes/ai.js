const express = require('express')
const router = express.Router({ mergeParams: true })
const aiController = require('../controllers/aiController')
const authMiddleware = require('../middleware/auth')

router.use(authMiddleware)

router.post('/summary', aiController.generateSummary)
router.get('/summary', aiController.getSummary)

module.exports = router; 