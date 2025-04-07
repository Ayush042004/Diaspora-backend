import { User } from "../models/user.model";
import jwt from "jsonwebtoken"
import {uploadOnCloudinary} from "../utils/cloudinary.js";

 export const generateAccessAndRefereshTokens = async(UserId)=> {
    try{
        const user = await User.findById(UserId);
        const accessToken =  await User.generateAccessToken();
        const refreshToken =  await User.generateRefreshToken();

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return{accessToken, refreshToken}

    } catch(error) {
        throw new Error("failed to generate tokens",error)
    }

}

 export const registerUser = async(req,res) => {

    try{
        const {name,email,password,role,address,phone} = req.body;

        if(
            [name,email,password,role,address,phone].some((field)=> field?.trim()=== "")
        ){
            throw new Error("Fill all the fields")
        }

        const existedUser = await User.findOne({email})

        if(existedUser){
            return res.status(400).json({message: "User already exist!"});
        }
        const user = await User.create({
            name,
            email,
            password,
            role,
            address,
            phone
        })
        const accessToken = await user.generateAccessToken();
        
        const refreshToken = await user.generateRefreshToken();
        
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        await user.save()

        const options = {
            httpOnly: true, 
            secure: false,
            sameSite: "lax",
            domain:"localhost"
        }
        
        return res.status(200)
        .cookie("accessToken", accessToken,options)
        .cookie("refreshToken", refreshToken,options)

    } catch(error){
        console.log(error)
        throw new Error("Error While Registration", error)
    }

}


export const loginUser = async(req,res) => {

    try{
        const {email,password} = req.body;

        if([email,password].some((field)=>field?.trim()=="")) throw new Error("Fill all the fields");

        const user = await User.findOne({email});
        if(!user) throw new Error("Invalid user credentials");

        const isMatch = await user.isPasswordCorrect(password);

        if(!isMatch)throw new Error("Invalid user credentials");

        const{accessToken,refreshToken} = await generateAccessAndRefereshTokens(user._id)
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
            
        const options = {
            httpOnly: true,
            secure: true,
        }

        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
                {
                    user:loggedInUser,
                    message: "User logged in successfully",
                    status:200
                }
        )

    } catch(error){
        console.log("Error while logging in the user",error.message)
       throw new Error("Error while logging in the user")
    }
}

export const logoutUser = async(req,res)=>{
    User.findByIdAndUpdate(
        req.user?._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,                                                         // sirf server se modify krskte h frontend se nhi kr skte
        secure: true
    }

    return res
            .status(200)
            .clearCookie("accessToken",options)
            .clearCookie("refreshToken",options)
            .json({message: "User logged out successfully"})   
}

export const refreshAccessToken = async(req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken) {
        throw new Error("Unauthorized Request")
    }

    try{
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        
        const user = await User.findById(decodedToken?._id)
        if(!user) {
            throw new Error("Invalid Refresh token")
        }

        if(incomingRefreshToken !== user?.refreshToken){
            throw new Error("Invalid token is expired or used ")
        }

        const {refreshToken, accessToken} = await generateAccessAndRefereshTokens(user._id)
        const newRefreshToken = refreshToken;

        await user.save({validateBeforeSave: false})

        const options = {
            httpOnly: true,
            secure: true
        }
        return res
                .status(200)
                .cookie("accessToken",accessToken,options)
                .cookie("refreshToken",newRefreshToken,options)
                .json(
                    {
                        message: "Access Token Refreshed"
                    }
                )
    } catch(error) {
        throw new Error("Error while generating access token",error)
    }
}

export const changeCurrentPassword = async(req,res)=>{
    const {oldPassword, newPassword} = req.body;

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new Error("Invalid old password")
    }

    user.password = newPassword
    user.save({validateBeforeSave:false})

    return res
            .status(200)
            .json(
                {
                message:"Password changed successfully"
                }
            )
}
export const getCurrentUser = async(req,res)=>{

    const user = await User.findById(req.user?._id)
                           .select("-password -refreshToken")
                           .populate("address");

    return res
            .status(200)
            .json({
                user,
                message:"Current user fetched successfully with address"
            })
}

export const updateUserProfile = async(req, res) => {
    try{
        const userId = req.user?._id;
        const {name,email,phone,address} = req.body;

        if(!name || !email || !phone || !address){
            throw new Error("Please fill in all fields")
        }
        
        
        const avatarLocalPath = req.file?.path;
        if(!avatarLocalPath){
            throw new Error("Please upload an avatar");
        }
        

        if(avatarLocalPath){
            
            const avatar = await uploadOnCloudinary(avatarLocalPath);
            if(!avatar?.url) {
                throw new Error("Error while uploading avatar");
            }
            
        }
      
    const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    name: name,
                    email: email,
                    phone: phone,
                    address: address,
                    avatar: avatar.url
                }
            },
            {new: true}
        ).select("-password -role")

        return res 
        .status(200)
        .json({
             message:"Account details updated successfully",
             user : updatedUser,
        });

    } catch(err) {
        throw new Error("Error while updating user profile")
    }
}