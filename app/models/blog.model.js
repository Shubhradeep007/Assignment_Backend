const mongoose = require('mongoose')
const schema = mongoose.Schema

const BlogSchema = new schema({
    blog_title:{
        type: String,
        required: true
    },
    blog_content:{
        type: String,
        required: true
    },
    blog_image:{
        type: String,
        required: true
    },
    blog_author:{
        type: schema.Types.ObjectId,
        ref: "user_model"
    }
}, {timestamps: true})

const BlogModel = mongoose.model("blog_model", BlogSchema)

module.exports = BlogModel 