const express = require('express')
const router = express.Router()
const agentController = require('../controllers/agentController')
const authMiddleware = require('../middleware/auth')
const { agentLimiter } = require('../middleware/rateLimiter')

router.use(authMiddleware)

router.post('/chat', agentLimiter, agentController.chat)

module.exports = router