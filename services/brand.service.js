import { Brand } from "../models/Brand.js";
import { deleteLocalFile } from "../utils/utils.js";

export const createBrands = async (marcas) => {
    const savedBrands = [];

    for (const m of marcas) {
        const brand = new Brand({
            marca: m.marca,
            star: m.star,
            imagenes: m.imagenes,
            color: m.color,
        });
        await brand.save();
        savedBrands.push(brand);
    }

    return savedBrands;
};

export const getAllBrands = async () => {
    return await Brand.find().sort({ createdAt: -1 });
};

export const deleteBrand = async (id) => {
    const brand = await Brand.findById(id);
    if (!brand) throw new Error("Marca no encontrada");

    if (brand.imagenes && brand.imagenes.length > 0) {
        for (const imgUrl of brand.imagenes) {
            deleteLocalFile(imgUrl);
        }
    }

    return await Brand.findByIdAndDelete(id);
};
