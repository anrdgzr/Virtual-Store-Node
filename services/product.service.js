import Product from "../models/Product.js";
import { deleteLocalFile } from "../utils/utils.js";

export const createProduct = async (data) => {
    const nuevoProducto = new Product(data);
    return await nuevoProducto.save();
};

export const getProducts = async (categoriaId = null) => {
    let query = {};

    if (categoriaId) {
        query.categoria = categoriaId;
    }

    return await Product.find(query)
        .populate("marca")
        .populate("categoria");
};

export const deleteProduct = async (id) => {
    const producto = await Product.findById(id);
    if (!producto) {
        const error = new Error("Producto no encontrado");
        error.status = 404;
        throw error;
    }

    for (const imgUrl of producto.imagenes) {
        deleteLocalFile(imgUrl);
    }

    return Product.findByIdAndDelete(id);
};

export const restarStockVariante = async (productId, skuVariante, cantidad) => {
    const producto = await Product.findById(productId);
    if (!producto) throw new Error("Producto no encontrado");

    const stockRestante = await producto.restarStockVariante(skuVariante, cantidad);
    return { producto, stockRestante };
};

export const updateProduct = async (id, nombre, precioBase, descripcion, star, marca, variantes, existingImages, files, categoria) => {
    const parsedVariantes = typeof variantes === "string" ? JSON.parse(variantes) : variantes;
    const parsedExistingImages = typeof existingImages === "string" ? JSON.parse(existingImages) : existingImages;
    const isStar = star === "true" || star === true;

    if (!id || id === "undefined") {
        const error = new Error("ID de producto inválido");
        error.status = 400;
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
        deleteLocalFile(imgUrl);
    }

    const uploadedNewImages = [];
    if (files && files.length > 0) {
        for (const file of files) {
            uploadedNewImages.push(`/uploads/${file.filename}`);
        }
    }

    const finalImages = [...parsedExistingImages, ...uploadedNewImages];

    product.nombre = nombre;
    product.precioBase = Number(precioBase);
    product.descripcion = descripcion;
    product.marca = marca;
    product.categoria = categoria;
    product.star = isStar;
    product.variantes = parsedVariantes;
    product.imagenes = finalImages;

    return await product.save();
};