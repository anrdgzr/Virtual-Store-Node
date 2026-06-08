import mongoose from "mongoose";

const varianteSchema = new mongoose.Schema(
    {
        sku: { type: String, required: true },
        atributo: { type: String, required: true },
        cantidad: { type: Number, required: true, default: 0 },
        // precioExtra: { type: Number, default: 0 }
    },
    { _id: false }
);

const productSchema = new mongoose.Schema(
    {
        nombre: { type: String, required: true },
        descripcion: { type: String, required: true },
        especificaciones: { type: Map, of: String },
        precioBase: { type: Number, required: true },
        marca: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
        categoria: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
        variantes: [varianteSchema],
        ranking: { type: Number, default: null },
        star: { type: Boolean, default: false },
        imagenes: [{ type: String, required: true }]
    },
    { timestamps: true }
);

productSchema.set("toJSON", {
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
    }
});

productSchema.methods.restarStockVariante = async function (skuVariante, cantidadARestar) {
    const variante = this.variantes.find(v => v.sku === skuVariante);
    if (!variante) throw new Error(`La variante "${skuVariante}" no existe`);

    if (variante.cantidad < cantidadARestar)
        throw new Error(`Stock insuficiente. Disponible: ${variante.cantidad}`);

    variante.cantidad -= cantidadARestar;
    await this.save();
    return variante.cantidad;
};

export default mongoose.model("Product", productSchema, "products");