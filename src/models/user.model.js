import mongoose , {Schema} from "mongoose"
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
      name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true,
        unique: true
      },
      password: {
        type: String,
        required: true
      },
      role: {
        type: String,
        enum: ["buyer", "seller"],default: "buyer"
      },
      address: {
        type: String
      },
      phone: {
        type: String,
        required: true,
        unique: true,
        match: [/^(?:\+91|91|0)?[6-9]\d{9}$/,"Please enter a valid Indian phone number"]
      },
      refreshToken: {
        type: String,
      },
    },
    {timestamps : true}
);

userSchema.pre("save",async function (next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = async function(){
    return jwt.sign(
        {
            _id:this._id,
            name:this.name,
            email:this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = async function(){
    return jwt.sign(
        {
            _id:this._id,
            name:this.name,
            email:this.email,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userSchema)