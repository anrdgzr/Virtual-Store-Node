import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    imagen: {
        type: String,
        required: true
    },
    activa: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default mongoose.model("Category", categorySchema, "categorias");