import Product from "../models/Product.js";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

export const extractPublicId = (url) => {
    try {
        
        const parts = url.split('/upload/'); 
        if (parts.length < 2) return null;
        
        const pathWithoutVersion = parts[1].replace(/^v\d+\//, ''); 
        
        const publicId = pathWithoutVersion.substring(0, pathWithoutVersion.lastIndexOf('.'));
        return publicId;
    } catch (error) {
        console.error("Error extrayendo public_id:", error);
        return null;
    }
};
export const createProduct = async (data) => {
    const nuevoProducto = new Product(data);
    return await nuevoProducto.save();
};

export const getProducts = async () => {
    return await Product.find();
};

export const deleteProduct = async (id) => {
    const producto = await Product.findById(id);
    if (!producto) {
        const error = new Error("Producto no encontrado");
        error.status = 404;
        throw error;
    }

    for (const imgUrl of producto.imagenes) {
        const publicId = extractPublicId(imgUrl);
        if (publicId) {
            await cloudinary.uploader.destroy(publicId);
            // console.log(`Eliminado de Cloudinary (Product Delete): ${publicId}`);
        }
    }
        
    return Product.findByIdAndDelete(id);
};

export const restarStockSabor = async (productId, sabor, cantidad) => {
    const producto = await Product.findById(productId);
    if (!producto) throw new Error("Producto no encontrado");

    const stockRestante = await producto.restarStockSabor(sabor, cantidad);
    return { producto, stockRestante };
};

export const updateProduct = async (id, nombre, precio, descripcion, star, marca, sabores, existingImages, files) => {
    const parsedSabores = typeof sabores === "string" ? JSON.parse(sabores) : sabores;
    const parsedExistingImages = typeof existingImages === "string" ? JSON.parse(existingImages) : existingImages;
    
    const isStar = star === "true" || star === true; 

    if (!id || id === "undefined") {
        const error = new Error("ID de producto inválido o no proporcionado");
        error.status = 404;
        throw error;
    }

    const product = await Product.findById(id);
    if (!product) {
        const error = new Error("Producto no encontrado");
        error.status = 404;
        throw error;
    }

    const imagesToDelete = product.imagenes.filter(imgUrl => !parsedExistingImages.includes(imgUrl));
    
    for (const imgUrl of imagesToDelete) {
        const publicId = extractPublicId(imgUrl);
        if (publicId) {
            await cloudinary.uploader.destroy(publicId);
            // console.log(`Eliminado de Cloudinary: ${publicId}`);
        }
    }

    const uploadedNewImages = [];
    if (files && files.length > 0) {
        for (const file of files) {
            const uploaded = await cloudinary.uploader.upload(file.path, {
                folder: "products", 
                resource_type: "image",
            });
            uploadedNewImages.push(uploaded.secure_url);
            
            fs.unlinkSync(file.path); 
        }
    }

    const finalImages = [...parsedExistingImages, ...uploadedNewImages];

    product.nombre = nombre;
    product.precio = Number(precio);
    product.descripcion = descripcion;
    product.marca = marca;
    product.star = isStar;
    product.sabores = parsedSabores;
    product.imagenes = finalImages;

    return await product.save();
};