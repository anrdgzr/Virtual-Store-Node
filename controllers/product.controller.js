import * as productService from "../services/product.service.js";

// Crear producto
export const createProduct = async (req, res) => {
    try {
        const { nombre, precioBase, descripcion, star, variantes, marca, categoria } = req.body;
        const variantesParsed = JSON.parse(variantes);

        const imagenes = req.body.processedImages || [];

        const nuevoProducto = await productService.createProduct({
            nombre,
            precioBase,
            descripcion,
            star,
            marca,
            variantes: variantesParsed,
            imagenes,
            categoria
        });

        res.status(201).json(nuevoProducto);
    } catch (error) {
        console.error("Error creando producto back:", error);
        res.status(500).json({ message: "Error al crear el producto" });
    }
};

// Listar productos
export const getProducts = async (req, res) => {
    try {
        const { categoria } = req.query;

        const productos = await productService.getProducts(categoria);
        res.json(productos);
    } catch (error) {
        console.error("Error listando productos:", error);
        res.status(500).json({ message: "Error al obtener productos" });
    }
};

// Actualizar producto
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, precioBase, descripcion, star, marca, variantes, existingImages, categoria } = req.body;

        const newImages = req.body.processedImages || [];

        const updatedProduct = await productService.updateProduct(
            id,
            nombre,
            precioBase,
            descripcion,
            star,
            marca,
            variantes,
            existingImages,
            newImages,
            categoria
        );

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error("Error actualizando producto:", error);
        res.status(500).json({ message: "Error al actualizar el producto", error: error.message });
    }
};

// Eliminar producto
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await productService.deleteProduct(id);
        res.json({ message: "Producto y sus imágenes locales eliminados" });
    } catch (error) {
        console.error("Error eliminando producto:", error);
        res.status(error.status || 500).json({ message: error.message || "Error al eliminar producto" });
    }
};

// Actualizar Stock
export const restarStockVariante = async (req, res) => {
    try {
        const { id } = req.params;
        const { sku, cantidad } = req.body;

        const { producto, stockRestante } = await productService.restarStockVariante(
            id,
            sku,
            cantidad
        );

        res.json({
            message: `Stock actualizado para ${sku}`,
            stockRestante,
            producto,
        });
    } catch (error) {
        console.error("Error actualizando stock:", error);
        res.status(400).json({ message: error.message });
    }
};