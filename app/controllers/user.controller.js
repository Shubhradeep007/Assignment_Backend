const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const path = require('path')

const UserModel = require("../models/user.model")
const StatusCode = require("../utils/Status.codes")
const { UserSchmaValidation, UserUpdateSchemaValidation } = require('../utils/user.validation')
const deleteFile = require('../utils/deleteUserImages')
const { cloudinary } = require('../utils/cloud.imageUpload')


const SALT = 12;

class UserController {
    async registerUser(req, res) {
        try {
            const requestPayload = {
                user_name: req.body.user_name,
                user_email: req.body.user_email,
                user_password: req.body.user_password,
                user_profile_image: req.file ? req.file.path : undefined,
                user_about: req.body.user_about
            };

            const { error, value } = UserSchmaValidation.validate(requestPayload);

            if (error) {
                const messages = error.details.map(err => err.message);

                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: messages
                });
            }

            const existUser = await UserModel.findOne({ user_email: value.user_email });
            if (existUser) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "User already exists"
                });
            }

            const hashPassword = await bcrypt.hash(value.user_password, SALT);

            const user = new UserModel({
                user_name: value.user_name,
                user_email: value.user_email,
                user_password: hashPassword,
                user_profile_image: value.user_profile_image,
                user_about: value.user_about
            });

            await user.save();
            const responseUser = {
                user_name: user.user_name,
                user_email: user.user_email,
                user_profile_image: user.user_profile_image,
                user_about: user.user_about,
                _id: user._id,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };
            return res.status(201).json({
                success: true,
                message: "User registered successfully",
                data: responseUser
            });
        } catch (err) {
            console.error(err);
            res.status(StatusCode.BAD_GATEWAY).json({
                success: false,
                message: "Server error"
            });
        }
    }


    async loginUser(req, res) {
        try {
            const { user_email, user_password } = req.body

            if (!user_email || !user_password) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "All field are required"
                })
            }

            const user = await UserModel.findOne({ user_email })

            if (!user) {
                return res.status(StatusCode.BAD_GATEWAY).json({
                    success: false,
                    message: "User not found"
                })
            }

            const isMatch = await bcrypt.compare(user_password, user.user_password)

            if (!isMatch) {
                return res.status(StatusCode.BAD_GATEWAY).json({
                    success: false,
                    message: "password doesn't match!"
                })
            }

            const token = jwt.sign({
                id: user._id,
                user_name: user.user_name,
                user_email: user.user_email,
                user_profile_image: user.user_profile_image,
                user_about: user.user_about,
                createdAt: user.createdAt
            }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" })


            return res.status(StatusCode.SUCCESS).json({
                success: true,
                message: "user loging successfully",
                data: {
                    id: user._id,
                    name: user.user_name,
                    email: user.user_email,
                    image: user.user_profile_image,
                    about: user.user_about || ""
                },
                token: token
            })
        } catch (error) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: "login failed"
            })
        }
    }

    async updateUserProfile(req, res) {
        try {
            const id = req.params.id

            const data = {}
            if (req.body.user_name) data.user_name = req.body.user_name
            if (req.body.user_email) data.user_email = req.body.user_email
            if (req.body.user_password) data.user_password = req.body.user_password
            if (req.body.user_about !== undefined) data.user_about = req.body.user_about

            // Get the current user to check for old image
            const currentUser = await UserModel.findById(id)

            // Only add profile image if file is uploaded or explicitly provided
            if (req.file) {
                // Delete old image if it exists
                if (currentUser.user_profile_image) {
                    if (!currentUser.user_profile_image.startsWith('http')) {
                        const oldImagePath = path.join(__dirname, '../../', currentUser.user_profile_image)
                        deleteFile(oldImagePath)
                    } else {
                        const publicId = currentUser.user_profile_image.split('/').slice(-2).join('/').split('.')[0];
                        await cloudinary.uploader.destroy(publicId);
                    }
                }
                data.user_profile_image = req.file.path
            } else if (req.body.user_profile_image) {
                data.user_profile_image = req.body.user_profile_image
            }

            const { error, value } = UserUpdateSchemaValidation.validate(data)

            if (error) {
                const messages = error.details.map(err => err.message);
                // Delete uploaded file if validation fails
                if (req.file) {
                    const publicId = req.file.path.split('/').slice(-2).join('/').split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                }
                return res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: messages
                })
            }

            if (value.user_password) {
                value.user_password = await bcrypt.hash(value.user_password, SALT)
            }
            const updatedUser = await UserModel.findByIdAndUpdate(id, value, { new: true })

            if (!updatedUser) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "User not found"
                })
            }

            const responseUser = {
                user_name: updatedUser.user_name,
                user_email: updatedUser.user_email,
                user_profile_image: updatedUser.user_profile_image,
                user_about: updatedUser.user_about,
                _id: updatedUser._id,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt
            };

            return res.status(StatusCode.SUCCESS).json({
                success: true,
                message: "User updated successfully",
                data: responseUser
            })

        } catch (error) {
            console.error(error);
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: "Failed to update user profile"
            })
        }
    }

    async deleteUser(req, res) {
        try {
            const id = req.params.id
            const deletedUser = await UserModel.findByIdAndDelete(id)

            if (!deletedUser) {
                return res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: "User not found"
                })
            }

            // Delete user's profile image if it exists
            if (deletedUser.user_profile_image) {
                if (!deletedUser.user_profile_image.startsWith('http')) {
                    const imagePath = path.join(__dirname, '../../', deletedUser.user_profile_image)
                    deleteFile(imagePath)
                } else {
                    const publicId = deletedUser.user_profile_image.split('/').slice(-2).join('/').split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                }
            }

            const responseUser = {
                user_name: deletedUser.user_name,
                user_email: deletedUser.user_email,
                user_profile_image: deletedUser.user_profile_image,
                user_about: deletedUser.user_about,
                _id: deletedUser._id,
                createdAt: deletedUser.createdAt,
                updatedAt: deletedUser.updatedAt
            };
            return res.status(StatusCode.SUCCESS).json({
                success: true,
                message: "User deleted successfully",
                data: responseUser
            })
        } catch (error) {
            console.error(error);
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: "Failed to delete user"
            })
        }
    }


    async getUserProfile(req, res) {
        try {
            return res.status(StatusCode.SUCCESS).json({
                success: true,
                message: "User details! ",
                data: req.user
            })
        } catch (error) {
            return res.status(StatusCode.SERVER_ERROR).json({
                success: false,
                message: error.message || "Failed to get user profile"
            })
        }
    }


}


module.exports = new UserController()