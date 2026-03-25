import mongoose from "mongoose";

// Subdocumento para los sabores con stock
const saborSchema = new mongoose.Schema(
    {
        nombre: { type: String, required: true },
        cantidad: { type: Number, required: true, default: 0 }
    },
    { _id: false }
);

const productSchema = new mongoose.Schema(
    {
        nombre: { type: String, required: true },
        descripcion: { type: String, required: true },
        precio: { type: Number, required: true },
        marca: { type: String, required: true },
        sabores: [saborSchema],
        star: { type: Boolean, default: false },
        imagenes: [{ type: String, required: true }]
    },
    { timestamps: true }
);

// Transformación al convertir a JSON
productSchema.set("toJSON", {
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
    }
});

// Método para restar stock de un sabor
productSchema.methods.restarStockSabor = async function (nombreSabor, cantidadARestar) {
    const sabor = this.sabores.find(s => s.nombre === nombreSabor);
    if (!sabor) throw new Error(`El sabor "${nombreSabor}" no existe`);

    if (sabor.cantidad < cantidadARestar)
        throw new Error(`Stock insuficiente para "${nombreSabor}". Disponible: ${sabor.cantidad}`);

    sabor.cantidad -= cantidadARestar;
    this.cantidad -= cantidadARestar;
    await this.save();

    return sabor.cantidad;
};

export default mongoose.model("Product", productSchema);