const { ApiError } = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')

const isLoggedin = asyncHandler(async (req,res,next) => {
    try {
        const token = req.cookies?.accessToken || req?.header("Authorization")?.replace("Bearer", "")
    
        if (!token){
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
    
        if (!decodedToken){
            throw new ApiError(409, "Invalid token")
        }
    
        const user = await userModel.findById(decodedToken._id)
        req.user = user
        next()
    } catch (error) {
        console.log("Error", error?.message || error)
    }
})

module.exports = {isLoggedin}