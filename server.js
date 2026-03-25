import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

import productRoutes from "./routes/product.routes.js";
import authRoutes from "./routes/auth.routes.js";
import orderRoutes from "./routes/order.routes.js";
import brandRoutes from "./routes/brand.routes.js";
import userRoutes from "./routes/user.routes.js"
import metricsRoutes from "./routes/metrics.routes.js"

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB conectado"))
    .catch(err => console.error("Error MongoDB:", err));

// Rutas
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/user", userRoutes);
app.use("/api/metrics", metricsRoutes);

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.listen(process.env.PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${process.env.PORT}`);
    console.log("Cloudinary vars:", process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY);
});

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

