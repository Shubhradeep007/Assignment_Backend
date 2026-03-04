const Joi = require('joi')

const UserSchmaValidation = Joi.object({
    user_name: Joi.string()
        .required()
        .messages({
            'string.empty': 'User name is required',
            'any.required': 'User name is required'
        }),
    user_email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'in'] } })
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'string.empty': 'Email is required',
            'any.required': 'Email is required'
        }),
    user_password: Joi.string()
        .min(6)
        .required()
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'string.empty': 'Password is required',
            'any.required': 'Password is required'
        }),

    user_profile_image: Joi.string().optional(),
    user_about: Joi.string().allow('').optional()
})

const UserUpdateSchemaValidation = Joi.object({
    user_name: Joi.string()
        .optional()
        .messages({
            'string.empty': 'User name cannot be empty'
        }),
    user_email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'in'] } })
        .optional()
        .messages({
            'string.email': 'Please provide a valid email address',
            'string.empty': 'Email cannot be empty'
        }),
    user_password: Joi.string()
        .min(6)
        .optional()
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'string.empty': 'Password cannot be empty'
        }),

    user_profile_image: Joi.string().optional(),
    user_about: Joi.string().allow('').optional()
})

module.exports = { UserSchmaValidation, UserUpdateSchemaValidation }