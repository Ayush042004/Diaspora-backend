import {Router} from "express";
import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
} from "../controllers/product.controller.js"
import { verifyJWT } from "../middlewares/verifyJWT.middleware.js";
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();

router.route("/").get(getAllProducts);
router.route("/:id").get(getProductById);

router.route("/").post(verifyJWT,upload.array("images",5),createProduct);

router.route("/:id").put(verifyJWT,upload.array("images",5),updateProduct)
.delete(verifyJWT,deleteProduct);

export default router;