const mongoose = require('mongoose')
const aggregatePaginate = require('mongoose-aggregate-paginate-v2')

const videoSchema = new mongoose.Schema({
    videoFile: {
        type: String,
        required: [true, 'Video file is required'],
    },
    thumbnail: {
        type: String,
        required: [true, 'Thumbnail is required'],
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
    },
    duration: {
        type: Number,
        required: [true, 'Duration is required'],
    },
    views: {
        type: Number,
        default: 0, 
    },
    isPublished: {
        type: Boolean,
        default: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'Owner is required'],
    },
},{timestamps: true})

videoSchema.plugin(aggregatePaginate)

const videoModel = mongoose.model('video', videoSchema)

module.exports = videoModel