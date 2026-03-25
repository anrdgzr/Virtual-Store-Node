import {Brand} from "../models/Brand.js";

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
