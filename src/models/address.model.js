import mongoose, {Schema} from "mongoose";


const addressSchema = new Schema ({
    address_line: {
        type: String,
        default: ""
    },
    city:{
        type: String,
        default: ""
    },
    state:{
        type: String,
        default: ""
    },
    country:{
        type: String
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        default: ""
    }
},
{timestamps: true})

export const Address = mongoose.model("Address", addressSchema);