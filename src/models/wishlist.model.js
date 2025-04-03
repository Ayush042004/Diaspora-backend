import mongoose , {Schema} from "mongoose"


const WishlistSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    }

});

export const Wishlist = mongoose.model("Wishist", WishlistSchema)