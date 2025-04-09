import {Product} from "../models/product.model.js";
import {Category} from "../models/category.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createProduct = async (req,res) => {
    try{

        if (req.user?.role !== "seller") {
            return res.status(403).json({ message: "Only sellers can create products" });
        }
        
        const {name, description, price,category, stock,subcategory} = req.body;
        const seller = req.user?._id

        if(
            [name,description,price,category,stock,subcategory].some((field)=> field?.trim()=== "")
        ){
            throw new Error("Fill all the fields")
        }
        
        const foundCategory = await Category.findById(category);
        if(!foundCategory){
            throw new Error("Invalid category");
        }

        if(subcategory && !foundCategory.subcategories.includes(subcategory)) {
            throw new Error("Invalid subcategory for selected category");
        }

       
        let images = [];
        if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map(file => uploadOnCloudinary(file.path));
        const uploadedImages = await Promise.all(uploadPromises);
        images = uploadedImages.map(img => img.url);
       }

        const product = await Product.create({
            name,
            description,
            price,
            category,
            subcategory,
            stock,
            seller,
            images
        });

        return res.status(201).json({
            message: "Product created successfully",
            product,
        });

    } catch(err){
        console.log(err);
        return res.status(500).json({ message: "Failed to create product", error: err.message });
    }
};

export const getAllProducts = async (req,res) => {
    try {
        const products = await Product.find()
        .populate("category","name")
        .populate("seller","name email");

        res.status(200).json(products,
            "Products fetched all"
        );

        
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Failed to create product", error: err.message });
    }
}


export const getProductById = async(req,res) => {
    try {
        const product = await Product.findById(req.params.id)
           .populate("category","name subcategories")
           .populate("seller", "name email avatar");

        if(!product) 
        return
        res.status(404)
        .json({
            message: "Product not found"
        });


        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: "Error fetching product", error: err.message });
    }
}


export const updateProduct = async(req,res) => {
    try {
        const sellerId = req.user?._id;
        const {name, description, price,stock} = req.body;

        const product = await Product.findById(req.params.id);

        if(!product) return res.status(404).json({message: "Product not found"});
        if (String(product.seller) !== String(sellerId)) {
            return res.status(403).json({ message: "Unauthorized to update this product" });
          }

          if(req.files && req.files.length > 0){
            const uploadPromises = req.files.map(file => uploadOnCloudinary(file.path));
            const uploadedImages = await Promise.all(uploadPromises);
            product.images = uploadedImages.map(img => img.url);
          }
          
         const updatedProduct = await Product.findByIdAndUpdate(
            product._id,
            {
                $set: {
                    name: name,
                    description: description,
                    price: price,
                    stock: stock,
                    images: product.images
                }
            },
            {new : true}
          ).select("-password")

          await product.save();

          return res
          .status(200)
          .json({
            message: "Product updated",
            product: updatedProduct,
          })
        
        
    } catch (error) {
        res.status(500).json({message: "Failed to update product", error: error.message});
    }
}

export const deleteProduct = async (req,res) => {
    try {
        const sellerId = req.user?._id;

        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
    
        
    if (String(product.seller) !== String(sellerId)) {
        return res.status(403).json({ message: "Unauthorized to delete this product" });
      }

      await product.deleteOne();
      return res.status(200).json({ message: "Product deleted successfully" });
        
    } catch (error) {
        res.status(500).json({message: "Failed to delete product",error: error.message});
    }
}