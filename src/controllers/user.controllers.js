import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnClodinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
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
    console.log(userName, email, password, "user details");

    //validation - not empty

    if ([fullName, userName, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    //check if user already exists  : userName , email

    const existedUser = User.findOne({ $or: [{ email }, { userName }] });
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    // check for images , check for avatar and cover image
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    console.log(req.files, "files from multer");
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image are required");
    }

    // upload to cloudinary and get the url
    const avatar = await uploadOnClodinary(avatarLocalPath);
    const coverImage = await uploadOnClodinary(coverImageLocalPath);
    if(!avatar){
        throw new ApiError(400, "Avatar image are required");
    }

    // now create the  user object - create entry in db
    const user = await User.create({
        fullName,
        userName : userName.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || null,
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if(!createdUser){
        throw new ApiError(500, "User creation failed, something went wrong while creating user");
    }
    return res.status(201).json(new ApiResponse(200, createdUser,"User registred successfully"));

});
export { registerUser };