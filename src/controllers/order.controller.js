 import { Order } from "../models/order.model.js";
 import {Product} from "../models/product.model.js"
 import {Address} from "../models/order.model.js"



 export const createOrder = async (req,res) => {
   try {
      const {products , deliveryAddress, totalAmount} = req.body;

      if(!products || products.length === 0 || !deliveryAddress || !totalAmount) {
         throw new Error("All fields are required")
      }
      
      const order = await Order.create({
         buyer: req.user._id,
         products,
         deliveryAddress,
         totalAmount
      });

      return res.status(201).json({
         message: "Order placed successfully",
         order
      })
   } catch (error) {
      return res.status(500).json({message: error.message})
   }  
 };

 export const getMyOrders = async(req,res) => {
   try {
      const orders = await Order.find({buyer: req.user._id})
                                     .populate("products.product")
                                     .populate("deliveryAddress")
                                     .sort({createdAt: -1});

      return res.status(200).json({
         message: "users order fecheted",
         orders
      })

   } catch (error) {
      return res.status(500).json({message: error.message})
      
   }
 }

export const getAllOrders = async (req,res) => {
   try {
      const orders = await Order.find()
                                .populate("buyer","name email")
                                .populate("prducts.product")
                                
      
   } catch (error) {
      
   }
}
