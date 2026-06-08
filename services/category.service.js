import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { deleteLocalFile } from "../utils/utils.js";

export const getAllCategories = async () => {
    return await Category.find().sort({ nombre: 1 });
};

export const createCategoryService = async (data) => {
    const { nombre, slug, imagen } = data;
    const newCategory = new Category({ nombre, slug, imagen });
    return await newCategory.save();
};

export const deleteCategoryService = async (id) => {
    const toolsUsingCategory = await Product.countDocuments({ categoria: id });
    if (toolsUsingCategory > 0) {
        const error = new Error(`Hay ${toolsUsingCategory} herramienta(s) usando esta categoría.`);
        error.status = 400;
        throw error;
    }

    const category = await Category.findById(id);
    if (!category) {
        const error = new Error("Categoría no encontrada");
        error.status = 404;
        throw error;
    }

    if (category.imagen) {
        try {
            deleteLocalFile(category.imagen);
        } catch (imgError) {
            console.error("Error eliminando imagen de categoría:", imgError);
        }
    }

    return await Category.findByIdAndDelete(id);
};