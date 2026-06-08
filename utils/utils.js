import fs from "fs";
import path from "path";

export const deleteLocalFile = (imgUrl) => {
    try {
        const filePath = path.join(process.cwd(), imgUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error("Error eliminando archivo local:", error);
    }
};