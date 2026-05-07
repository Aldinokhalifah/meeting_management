const Resend = require('resend').Resend

if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️  RESEND_API_KEY tidak diset di .env')
}

const resend = new Resend(process.env.RESEND_API_KEY)

module.exports = resend