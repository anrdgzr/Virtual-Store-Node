import * as productService from "../services/product.service.js";

// Crear producto
export const createProduct = async (req, res) => {
    try {
        const { nombre, precio, descripcion, star, sabores, marca } = req.body;
        const saboresParsed = JSON.parse(sabores);

        const imagenes = req.files.map((file) => file.path);

        const nuevoProducto = await productService.createProduct({
            nombre,
            precio,
            descripcion,
            star,
            marca,
            sabores: saboresParsed,
            imagenes,
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
        const productos = await productService.getProducts();
        res.json(productos);
    } catch (error) {
        console.error("Error listando productos:", error);
        res.status(500).json({ message: "Error al obtener productos" });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        let { nombre, precio, descripcion, star, marca, sabores, existingImages } = req.body;

        const updatedProduct = await productService.updateProduct(
            id, 
            nombre, 
            precio, 
            descripcion, 
            star, 
            marca, 
            sabores, 
            existingImages,
            req.files
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

        res.json({ message: "Producto eliminado" });
    } catch (error) {
        console.error("Error eliminando producto:", error);
        res.status(error.status || 500).json({
            message: error.message || "Error al eliminar producto"
        });
    }
};

export const restarStockSabor = async (req, res) => {
    try {
        const { id } = req.params;
        const { sabor, cantidad } = req.body;

        const { producto, stockRestante } = await productService.restarStockSabor(
            id,
            sabor,
            cantidad
        );

        res.json({
            message: `Stock actualizado para ${sabor}`,
            stockRestante,
            producto,
        });
    } catch (error) {
        console.error("Error actualizando stock:", error);
        res.status(400).json({ message: error.message });
    }
};