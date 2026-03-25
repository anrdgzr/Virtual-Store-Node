import Order from "../models/Order.js";

export const getMetrics = async (req, res) => {
    try {
        const { rango } = req.query;
        
        let dateQuery = {};
        const now = new Date();
        
        if (rango === "hoy") {
            const startOfDay = new Date(now.setHours(0, 0, 0, 0));
            dateQuery = { createdAt: { $gte: startOfDay } };
        } else if (rango === "semana") {
            const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
            startOfWeek.setHours(0, 0, 0, 0);
            dateQuery = { createdAt: { $gte: startOfWeek } };
        } else if (rango === "mes") {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            dateQuery = { createdAt: { $gte: startOfMonth } };
        }

        const baseMatch = { estado: { $ne: "cancelado" }, ...dateQuery };

        const [statsResult, topProductosResult, topMarcasResult, vipUsersResult] = await Promise.all([
            Order.aggregate([
                { $match: baseMatch },
                { $group: { _id: null, ingresos: { $sum: "$total" }, pedidos: { $sum: 1 } } }
            ]),

            Order.aggregate([
                { $match: baseMatch },
                { $unwind: "$productos" },
                { $group: { _id: "$productos.producto", ventas: { $sum: "$productos.cantidad" } } },
                { $sort: { ventas: -1 } },
                { $limit: 5 },
                { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "prod" } },
                { $unwind: "$prod" },
                { $project: { _id: 1, nombre: "$prod.nombre", ventas: 1 } }
            ]),

            Order.aggregate([
                { $match: baseMatch },
                { $unwind: "$productos" },
                { $lookup: { from: "products", localField: "productos.producto", foreignField: "_id", as: "prod" } },
                { $unwind: "$prod" },
                { $group: { _id: "$prod.marca", ventas: { $sum: "$productos.cantidad" } } },
                { $sort: { ventas: -1 } },
                { $limit: 3 }
            ]),

            Order.aggregate([
                { $match: { ...baseMatch, usuario: { $exists: true, $ne: null } } },
                { $group: { _id: "$usuario", totalGastado: { $sum: "$total" }, pedidos: { $sum: 1 } } },
                { $sort: { totalGastado: -1 } },
                { $limit: 3 },
                { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
                { $unwind: "$user" },
                { $project: { _id: 1, nombre: "$user.nombre", pedidos: 1, totalGastado: 1 } }
            ])
        ]);

        const ingresos = statsResult[0]?.ingresos || 0;
        const pedidos = statsResult[0]?.pedidos || 0;
        const ticketPromedio = pedidos > 0 ? (ingresos / pedidos).toFixed(2) : 0;

        const coloresNeobrutalistas = ["#FF3366", "#00E5FF", "#D6FF00", "#FF9900", "#B000FF"];
        const topProductosConColor = topProductosResult.map((prod, index) => ({
            ...prod,
            color: coloresNeobrutalistas[index] || "#000"
        }));

        res.status(200).json({
            ingresos,
            pedidos,
            ticketPromedio,
            tasaConversion: "N/A",
            topProductos: topProductosConColor,
            topMarcas: topMarcasResult,
            vipUsers: vipUsersResult
        });

    } catch (error) {
        console.error("❌ Error en getMetrics:", error);
        res.status(500).json({ error: "Error al calcular las métricas" });
    }
};