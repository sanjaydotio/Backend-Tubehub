const asyncHandler = require('../utils/asyncHandler')
const { ApiError } = require('../utils/ApiError')
const userModel =  require('../models/user.model')
const {uploadOnCloudinary} = require('../utils/cloudinary')
const {ApiResponse} = require('../utils/ApiResponse')


const resisterApi = asyncHandler(async (req,res) => {
    const {userName , email , fullName , password} = req.body

    if ( [userName , fullName , email , password].some((data) => data?.trim() === "") ){
        throw new ApiError(401, "All fields are required")
    }

    const existsUser = await userModel.findOne({
        $or: [{userName}, {email}]
    })

    if (existsUser) {
        throw new ApiError(409, "userName or email Already exists with this detail")
    }


    const avatarLocalPath = req.files?.avatar[0]?.path

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath){
        throw new ApiError(409, "Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    const createdUser = await userModel.create({
        userName,
        email,
        fullName,
        password,
        avatar: avatar?.url,
        coverImage: coverImage?.url || ""
    })

    const user = await userModel.findById( createdUser._id ).select("-password -refreshToken")

    if (!user){
        throw new ApiError(500, "User is not registered")
    }

    res.status(201).json(
        new ApiResponse(200, user , "User Registered Successfully")
    )

})


module.exports = {resisterApi}