import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Token inválido" });

        req.user = decoded; // { id, role }
        next();
    });
};

export const isAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Requiere rol de administrador" });
    }
    next();
};

export const optionalToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return next();
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (!err) {
            req.user = decoded;
        }
        next();
    });
};