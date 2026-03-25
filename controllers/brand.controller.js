import { createBrands, getAllBrands } from "../services/brand.service.js";

export const uploadBrands = async (req, res) => {
    try {
        const marcasRaw = req.body.marcas;
        let marcas = JSON.parse(marcasRaw);

        if (req.files) {
            for (const file of req.files) {

                const idx = file.fieldname.match(/\d+/)[0];

                if (!marcas[idx].imagenes) marcas[idx].imagenes = [];

                marcas[idx].imagenes.push(file.path);
            }
        }

        const saved = await createBrands(marcas);
        res.status(201).json(saved);
    } catch (err) {
        console.error("ERROR IN CONTROLLER:", err);
        res.status(500).json({ message: "Error subiendo marcas", error: err.message });
    }
};

export const fetchBrands = async (req, res) => {
    try {
        const brands = await getAllBrands();
        res.json(brands);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error obteniendo marcas", error: err.message });
    }
};