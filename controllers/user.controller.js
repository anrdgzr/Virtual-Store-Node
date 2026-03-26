import Order from "../models/Order.js";
import User from "../models/User.js";

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("-password")
            .populate("favorites");

        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Error al obtener el perfil" });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "No se encontró el ID del usuario en el token." });
        }
        const orders = await Order.find({ usuario: req.user.id })
            .populate("productos.producto")
            .sort({ createdAt: -1 });

        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Error al obtener los pedidos" });
    }
};

export const toggleFavorite = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = await User.findById(req.user.id);

        const isFavorited = user.favorites.includes(productId);

        if (isFavorited) {
            user.favorites = user.favorites.filter(id => id.toString() !== productId);
        } else {
            user.favorites.push(productId);
        }

        await user.save();
        res.status(200).json({ favorites: user.favorites });
    } catch (error) {
        console.error("Error toggling favorite:", error);
        res.status(500).json({ message: "Error al actualizar favoritos" });
    }
};