import {Product} from "../models/product.model.js";
import {Category} from "../models/category.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createProduct = async (req,res) => {
    try{

        if (req.user?.role !== "seller") {
            return res.status(403).json({ message: "Only sellers can create products" });
        }
        
        const {name, description, price,category:categoryId, stock,subcategory} = req.body;
        

        if(
            [name,description,price,categoryId,stock,subcategory].some((field)=> field?.trim()=== "")
        ){
            throw new Error("Fill all the fields")
        }

        if (isNaN(price) || isNaN(stock)) {
            return res.status(400).json({ message: "Price and stock must be numbers" });
        }
        
        const foundCategory = await Category.findById(categoryId);
        if(!foundCategory){
            throw new Error("Invalid category");
        }

        if(subcategory && !foundCategory.subcategories.includes(subcategory)) {
            return res.status(400).json({ message: "Invalid subcategory" });
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
            category: categoryId,
            subcategory,
            stock,
            seller: req.user._id,
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

        res.status(200).json({    message: "Products fetched successfully",
            products
    });

        
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


        res.status(200).json({
            message: "Prodcuts fetched successfully",
            product
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching product", error: err.message });
    }
}


export const updateProduct = async(req,res) => {
    try {
        
        const {name, description, price,stock,category:categoryId,subcategory} = req.body;

        const product = await Product.findById(req.params.id);

        if(!product) return res.status(404).json({message: "Product not found"});

        if (req.user.role !== "seller" || product.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this product" });
        }
        
        if (price && isNaN(price)) {
            return res.status(400).json({ message: "Price must be a number" });
        }

        if (stock && isNaN(stock)) {
            return res.status(400).json({ message: "Stock must be a number" });
        }
        
        if(categoryId) {
            const category = await Category.findById(categoryId);
            if(!category){
                return res.status(404).json({message: "Ivalid subcategory"})
            }
            product.category = categoryId
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

        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
    
        
    if(req.user.role !== "seller"|| product.seller.toString() !== req.user.id.toString()){
        return res.status(403).json({ message: "Not authorized to delete this product" });
    }

      await product.deleteOne();
      return res.status(200).json({ message: "Product deleted successfully" });
        
    } catch (error) {
        res.status(500).json({message: "Failed to delete product",error: error.message});
    }
}