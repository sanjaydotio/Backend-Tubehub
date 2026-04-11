const asyncHandler = require('../utils/asyncHandler')
const { ApiError } = require('../utils/ApiError')
const userModel =  require('../models/user.model')
const {uploadOnCloudinary} = require('../utils/cloudinary')
const {ApiResponse} = require('../utils/ApiResponse')
const jwt = require('jsonwebtoken')


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await userModel.findById(userId)

        const accessToken =  user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken , refreshToken}

    } catch (error) {
        throw new ApiError(500, "Token generation failed") 
    }
}

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

const loginApi = asyncHandler(async (req,res) => {
    const {userName , email , password} = req.body

    if ((!userName && !email)){
        throw new ApiError(401, "userName and email are required")
    }

    const isUserExist = await userModel.findOne({
        $or: [{userName}, {email}]
    })

    if (!isUserExist){
        throw new ApiError(400, "userName and email is not found")
    }

    const isPasswordValid = await isUserExist.isPasswordValid(password)

    if (!isPasswordValid){
        throw new ApiError(401, "Invalide Credentials Password is Wrong")
    }

    const user = await userModel.findById(isUserExist._id).select("-password -refreshToken")

    const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id)   

    res.status(200)
    .cookie("accessToken", accessToken)
    .cookie("refreshToken", refreshToken,)
    .json(new ApiResponse(200 , {user: user , accessToken , refreshToken} , "User Logged in Successfully"))
})

const logoutApi = asyncHandler(async (req,res) => {

    await userModel.findByIdAndUpdate(req.user._id, 
    {
        $set: {refreshToken: undefined}
    },
    {
        new: true
    })

    return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, "" , "User Logged Out"))
})

const refreshAccessToken = asyncHandler(async (req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken

    if (!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized Request")
    }


    const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    if (!decodedRefreshToken){
        throw new ApiError(401, "Invalid token")
    }

    const user = await userModel.findById(decodedRefreshToken._id)

    if (incomingRefreshToken !== user.refreshToken){
        throw new ApiError(409, "Invalid Request DB not found this token")
    }

    const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id)
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    res.status(200)
    .cookie("accessToken", accessToken)
    .cookie("refreshToken", refreshToken)
    .json(new ApiResponse(200, {} , "Refreshed New AccessToken Successfully"))

})

const changeCurrentPassword = asyncHandler(async (req,res) => {
    const {oldPassword , newPassword} = req.body

    if (!oldPassword || !newPassword){
        throw new ApiError(409, "Password field is required")
    }

    const user = await userModel.findById(req.user?._id)

    if (!user){
        throw new ApiError(401, "User Not Found")
    }

    const isPasswordCorrect = user.isPasswordValid(oldPassword)

    if (!isPasswordCorrect){
        throw new ApiError(401, "Old Password Is Wrong")
    }
    user.password = newPassword
    await user.save({validateBeforeSave: false})

    res.status(200)
    .json(new ApiResponse(200 , `Passowrd Changed was ${user.userName}` , "Password Changed Successfully"))

})

const getCurrentUser = asyncHandler(async (req,res) => {
    res.status(200).json(new ApiResponse(200 , req.user , "User Fetched Successfully"))
})

const updateUserDetails = asyncHandler(async (req,res) => {
    const {email , userName , fullName } = req.body

    if (!email && !userName && !fullName){
        throw new ApiError(401, "Unauthorized Request")
    }

    const user = await userModel.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                email,
                userName,
                fullName
            }
        },
        {new: true}
    ).select("-password")

    res.status(200)
    .json(new ApiResponse(200 , user , "User Details Updated Successfully"))

})

module.exports = {resisterApi , loginApi , logoutApi , refreshAccessToken , changeCurrentPassword , getCurrentUser , updateUserDetails}