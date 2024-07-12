import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
    watchHistory: [{
        type: Schema.Types.ObjectId,
        ref: "Video"
    }],
    userName: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String,// cloudinary url
        required: true
    },
    coverImage: {
        type: String, // cloudinary url
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    refreshToken: {
        type: String,
        required: true
    },

}, { timestamps: true });
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});


userSchema.methods.isPassWordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}
userSchema.methods.generateAccessToken = async function () {
    return await jwt.sign({
        _id: this._id,
        email: this.email,
        userName: this.userName,
        fullName: this.fullName
    },
        process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY
    }
    )
}
userSchema.methods.generateRefreshToken = async function () {
    return await jwt.sign({
        _id: this._id,
    },
        process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRY
    }
    )
}
export const User = mongoose.model("User", userSchema);