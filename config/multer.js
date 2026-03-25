import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        const folder = req.body.folder || "products";

        return {
            folder: folder,
            // allowed_formats: ["jpg", "png", "jpeg", "webp", "svg"],
            format: "webp",
            transformation: [{ quality: "auto" }]
        };
    },
});

const upload = multer({ storage });

export default upload;
