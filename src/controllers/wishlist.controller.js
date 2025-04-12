import {Wishlist} from "../models/wishlist.model";
import { Product } from "../models/product.model";

export const getWishlist = async (req,res)=> {
    const userId = req.user._id;

    const wishlist = await Wishlist.findOne({user: userId}).populate("products");

    if(!wishlist) {
        return res.status(200).json({
            message: "Wishlist is empty",
        });
    }

    return res.status(200).json({
        message: "wishlist fetched successfully",
        wishlist,
    })
}

export const addToWishlist = async(req,res) => {
    const userId = req.user._id;
    const {productId} = req.body;

    const product = await Product.findById(productId);
    if(!product){
        throw new Error("product not found")
    }
    let wishlist = await Wishlist.findOne({user: userId})

    if(!wishlist){
        wishlist = await Wishlist.create({user: userId, products:[productId]});
    } else{
        if(wishlist.products.includes(productId)){
            throw new Error("Product already in wishlist");
        }
        wishlist.products.push(productId);
        await wishlist.save();

        return res.status(200).json({
            message: "Product added to wishlist",
            wishlist
        })
    }
}

export const removeFromWishlist = async(req,res) => {
    const userId = req.user._id;
    const {productId} = req.body;

    const wishlist = await Wishlist.findOne({user: userId});
    if(!wishlist) {
        throw new Error("Wishlist not found");
    }

    wishlist.products = wishlist.products.filter(
        (id)=> id.toString() !== productId
    )
    await wishlist.save();
    
    return res.status(200).json({
        message:"Product removed from wishlist",
        wishlist
    })
}

export const clearWishlist = async(req,res) => {
    const userId = req.user._id;

    const wishlist = await Wishlist.findOne({user: userId});

    if(!wishlist){
        throw new Error("wishlist not found");
    }
     
    wishlist.products = [];
    await wishlist.save();

    return res.status(200).json({wishlist,message: "wishlist cleared successfully"});
}