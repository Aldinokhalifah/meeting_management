const openAi = require('openai');

const openrouter = (apiKey) => {
    return new openAi({
        baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
        apiKey: apiKey,
        defaultHeaders: {
            'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
            'X-Title': 'Meeting Management App',
        },
    })
}

module.exports = openrouter;