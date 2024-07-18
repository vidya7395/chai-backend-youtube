import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnClodinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/Apierror.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}
const registerUser = asyncHandler(async (req, res, next) => {
    // get user details from frontend
    //validation - not empty
    //check if user already exists  : userName , email
    // chcek for images , check for avatar and cover image
    // upload to cloudinary and get the url


    // now create the  user object - create entry in db
    // remove password and refresh token from the response
    // check for user creation
    // resturn the response

    // get details from frontend
    const { fullName, userName, email, password } = req.body;
    // console.log(userName, email, password, "user details");

    //validation - not empty

    if ([fullName, userName, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    //check if user already exists  : userName , email

    const existedUser = await User.findOne({ $or: [{ email }, { userName }] });
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    // check for images , check for avatar and cover image
    let avatarLocalPath
    if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
        avatarLocalPath = await req.files.avatar[0].path;
    }
    else {
        throw new ApiError(400, "Avatar image local is required");
    }
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    // upload to cloudinary and get the url
    const avatar = await uploadOnClodinary(avatarLocalPath);
    const coverImage = await uploadOnClodinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar image is required");
    }

    // now create the  user object - create entry in db
    const user = await User.create({
        fullName,
        userName: userName.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || null,
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "User creation failed, something went wrong while creating user");
    }
    return res.status(201).json(new ApiResponse(200, createdUser, "User registred successfully"));



});

const loginUser = asyncHandler(async (req, res, next) => {
    // get username / email and password  || from req body
    // check if user exists or not
    // check if password is correct or not
    // access and refresh token
    // send cokkie
    //send response

    // get username / email and password  || from req body
    const { userName, email, password } = req.body;

    if (!userName && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({
        $or: [{ userName }, { email }]
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const isPasswordMatch = await user.isPassWordCorrect(password);
    if (!isPasswordMatch) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    const options = {
        httpOnly: true,
        secure: true
    };
    console.log("token", accessToken, refreshToken);
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )

});


const logoutUser = asyncHandler(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: { refreshToken: undefined },

    }, { new: true });
    const option = {
        httpOnly: true,
        secure: true,
    };
    return res.status(200)
        .clearCookie("accessToken", option)
        .clearCookie("refreshToken", option)
        .json(new ApiResponse(200, null, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        if (!verifyJWT) {
            throw new ApiError(401, "unauthorized request")
        }
        const user = await User.findById(decodedToken._id);
        if(!user){
            throw new ApiError(401, "invalid request token")
        }
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "invalid request token")
        }
        const options ={
            httpOnly: true,
            secure: true
        }
    
        const { accessToken, newRefreshToken } = await generateAccessAndRefereshTokens(user._id)
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse(200, {accessToken, newRefreshToken}, "Access token refreshed successfully"))
    } catch (error) {
        throw new ApiError(401, "unauthorized request",error);
    }
});


export { registerUser, loginUser, logoutUser ,refreshAccessToken};