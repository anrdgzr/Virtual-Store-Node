import * as categoryService from "../services/category.service.js";

export const getCategories = async (req, res) => {
    try {
        const categorias = await categoryService.getAllCategories();
        res.status(200).json(categorias);
    } catch (error) {
        console.error("Error obteniendo categorías:", error);
        res.status(500).json({ message: "Error al obtener las categorías" });
    }
};

export const createCategory = async (req, res) => {
    try {
        const { nombre, slug } = req.body;

        if (!nombre || !slug) {
            return res.status(400).json({ message: "El nombre y el slug son obligatorios" });
        }

        let imagenPath = "";
        if (req.body.processedImages && req.body.processedImages.length > 0) {
            imagenPath = req.body.processedImages[0];
        }

        const nuevaCategoria = await categoryService.createCategoryService({ nombre, slug, imagen: imagenPath });
        res.status(201).json(nuevaCategoria);

    } catch (error) {
        console.error("Error creando categoría:", error);
        if (error.code === 11000) {
            return res.status(400).json({ message: "Esta categoría ya existe en el sistema." });
        }
        res.status(500).json({ message: "Error interno del servidor al crear categoría" });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await categoryService.deleteCategoryService(id);

        res.status(200).json({ message: "Categoría eliminada con éxito" });
    } catch (error) {
        console.error("Error eliminando categoría:", error);
        res.status(error.status || 500).json({ message: error.message || "Error interno del servidor" });
    }
};