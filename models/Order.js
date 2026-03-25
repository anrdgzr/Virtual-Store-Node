import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        usuario: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "user",
            required: false
        },
        productos: [
            {
                producto: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
                cantidad: { type: Number, required: true },
                precioUnitario: { type: Number, required: true },
                subtotal: { type: Number, required: true },
                sabores: [
                    {
                    nombre: { type: String, required: true },
                    cantidad: { type: Number, required: true }
                    }
                ]
            },
        ],
        total: {
            type: Number,
            required: true,
        },
        metodoPago: {
            type: String,
            enum: ["transferencia", "entrega"],
            required: true,
        },
        datosCliente: {
            nombre: { type: String, required: true },
            telefono: { type: String, required: true },
            direccion: { type: String, required: true },
            email: { type: String, required: true },
        },
        estado: {
            type: String,
            enum: ["pendiente", "confirmado", "cancelado"],
            default: "pendiente",
        },
        tipoEnvio: {
            type: String,
            enum: ["app", "personal", "encuentro"],
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
