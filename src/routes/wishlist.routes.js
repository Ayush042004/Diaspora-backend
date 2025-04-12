import {Router} from "express";
import { addToWishlist, getWishlist,removeFromWishlist,clearWishlist } from "../controllers/wishlist.controller";
import {verifyJWT} from "../middlewares/verifyJWT.middleware.js"

const router = Router();

router.route("/").get(verifyJWT,getWishlist);

router.route("/add").post(verifyJWT,addToWishlist);

router.route("/remove").delete(verifyJWT,removeFromWishlist);

router.route("/clear").delete(verifyJWT,clearWishlist);


export default router;