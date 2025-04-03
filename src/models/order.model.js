import mongoose , {Schema} from "mongoose"

const OrderSchema = new Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending","shipped","delivered"],
        default: "pending"
    },
},
{
    timestamps: true
})

export const Order = mongoose.model("Order",OrderSchema)