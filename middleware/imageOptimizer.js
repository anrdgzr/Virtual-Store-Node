import sharp from "sharp";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

export const optimizeProductImages = async (req, res, next) => {
    if (!req.files || req.files.length === 0) return next();

    req.body.processedImages = [];

    try {
        await Promise.all(
            req.files.map(async (file) => {
                const filename = `tool-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
                const filepath = path.join(uploadDir, filename);

                await sharp(file.buffer)
                    .resize(800, 800, {
                        fit: "inside",
                        withoutEnlargement: true
                    })
                    .toFormat("webp")
                    .webp({ quality: 80 })
                    .toFile(filepath);

                req.body.processedImages.push(`/uploads/${filename}`);
            })
        );

        next();
    } catch (error) {
        console.error("Error optimizando imágenes:", error);
        res.status(500).json({ message: "Error al procesar las imágenes", error: error.message });
    }
};