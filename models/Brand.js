import mongoose from "mongoose";

const brandSchema = new mongoose.Schema({
    marca: { type: String, required: true },
    imagenes: [{ type: String }],
    star: { type: Boolean, default: false },
    color: { type: String, default: "#000000" },
}, { timestamps: true });

export const Brand = mongoose.model("Brand", brandSchema);