import mongoose , {Schema} from "mongoose"

const productSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: { 
         type: mongoose.Schema.Types.ObjectId,
         ref: "Category",
         required: true 
    },
    images: 
        [{
            type: String
        }],
    stock: {
        type: Number,
        required: true,
        default: 1
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    
},
{
    timestamps: true
}
);

export const Product  = mongoose.model("Product", productSchema)