import { ApiError } from "../utils/Apierror.js";
import  {User} from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, _ , next) => {

   try {
     const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
     if (!token) {
         throw new ApiError(401, "Unauthorized");
     }
     // verify token
     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log(decodedToken);
     const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
     if(!user){
         throw new ApiError(401, "Unauthorized, Invalid access token  user");
     }
     req.user = user;
     next();
   } catch (error) {
    throw new ApiError(401,error, "Unauthorized, Invalid access token");
   }
});