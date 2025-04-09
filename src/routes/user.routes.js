import { Router } from "express";
import {
    loginUser,
    registerUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserProfile,
} from "../controllers/user.controller.js"
import{verifyJWT} from "../middlewares/verifyJWT.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/refresh-token").post(verifyJWT,refreshAccessToken)


router.route("/current-user").get(verifyJWT,getCurrentUser);
router.route("/change-password").post(verifyJWT,changeCurrentPassword);
router.route("/update-profile").post(verifyJWT,upload.single("avatar"),updateUserProfile);

export default router
