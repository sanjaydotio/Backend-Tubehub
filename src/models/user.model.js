const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, 'Username is required'],
        unique: [true, 'Username must be unique'],
        lowercase: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long'],
        index: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Email must be unique'],
        lowercase: true,
        trim: true,
        minlength: [3, 'Email must be at least 3 characters long'],
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [3, 'Full name must be at least 3 characters long'],
    },
    avatar: {
        type: String,
        required: [true, 'Avatar is required'],
        trim: true,
    },
    coverImage: {
        type: String,
        trim: true,
    },
    watchHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'video'
    }],
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
    },
    refreshToken: {
        type: String,
    }
},{timestamps: true});

userSchema.pre('save', async function (next) {
    if (!this.isModified("password")) return next()

        this.password = await bcrypt.hash(this.password , 12)
})

userSchema.methods.isPasswordValid = async function(password) {
    return await bcrypt.compare(password , this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        fullName: this.fullName,
        email: this.email,
        userName: this.userName
    },process.env.ACCESS_TOKEN_SECRET, 
    {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
    },process.env.REFRESH_TOKEN_SECRET, 
    {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
    )
}

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;