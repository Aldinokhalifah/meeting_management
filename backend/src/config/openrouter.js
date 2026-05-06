const openAi = require('openai');

const openrouter = new openAi({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
        'X-Title': 'Meeting Management App',
    },
})

module.exports = openrouter;