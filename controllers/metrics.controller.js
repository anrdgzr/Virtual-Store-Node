import { calculateMetricsService } from "../services/metrics.service.js";

export const getMetrics = async (req, res) => {
    try {
        const { rango } = req.query;

        const metrics = await calculateMetricsService(rango);

        res.status(200).json(metrics);

    } catch (error) {
        console.error("Error en getMetrics:", error);
        res.status(500).json({ error: "Error al calcular las métricas" });
    }
};