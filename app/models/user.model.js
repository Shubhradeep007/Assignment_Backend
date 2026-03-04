const mongoose = require('mongoose')
const schema = mongoose.Schema

const UserSchema = new schema({
    user_name:{
        type: String,
        required: true
    },
    user_email:{
        type: String,
        required: true,
        unique: true
    },
    user_password:{
        type: String,
        required: true
    },
    user_profile_image: {
        type: String,
        default: "default.png"
    },
    user_about:{
        type: String,
        default: ""
    }
}, {timestamps: true})

const UserModel = mongoose.model("user_model", UserSchema)

module.exports = UserModel