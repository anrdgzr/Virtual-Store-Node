import fs from "fs";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// REMOVE_BG
export const removeBackground = async (inputPath, outputPath) => {
    try {
        const response = await axios({
            method: "post",
            url: "https://api.remove.bg/v1.0/removebg",
            data: {
                image_file: fs.createReadStream(inputPath),
                size: "auto",
            },
            headers: {
                "X-Api-Key": process.env.REMOVE_BG_API_KEY,
            },
            responseType: "arraybuffer",
        });

        fs.writeFileSync(outputPath, response.data);
        return outputPath;
    } catch (err) {
        console.error("Error al quitar fondo:", err.response?.data || err.message);
        throw new Error("Falló la eliminación de fondo");
    }
};
//RemBG

import { rembg } from "@remove-background-ai/rembg.js";

export const remBackground = async (inputPath) => {
    try {
        const { outputImagePath, cleanup } = await rembg({
            apiKey: process.env.REM_BG_API_KEY,
            inputImage: inputPath,
        });

        console.log("✅ Fondo eliminado:", outputImagePath);
        return { outputPath: outputImagePath, cleanup };
    } catch (err) {
        console.error("❌ Error removiendo fondo:", err);
        throw err;
    }
};
