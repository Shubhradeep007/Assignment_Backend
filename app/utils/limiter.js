const rateLimit = require('express-rate-limit')

const loginLimiter = rateLimit({
    max: 5,
    windowMs: 60 * 60 * 1000,
    message: { success: false, message: 'Too many login attempts from this IP, please try again in an hour!' }
})

const globalLimiter = rateLimit({
    max: 100,
    windowMs: 15 * 60 * 1000,
    message: { success: false, message: 'Too many requests from this IP, please try again later.' }
})

module.exports = { loginLimiter, globalLimiter }