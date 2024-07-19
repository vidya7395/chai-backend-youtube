import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser, updateUserAvatar } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();
router.route("/register").post(upload.fields([{
    name: "avatar",
    maxCount: 1,

}, {
    name: "coverImage",
    maxCount: 1,
}]), registerUser);
router.route("/updateAvatar").post(upload.field({
    name: "avatar",
    maxCount: 1,

}), updateUserAvatar);

router.route("/login").post(loginUser);



//secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

export default router;