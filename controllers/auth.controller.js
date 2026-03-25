import bcrypt from "bcryptjs";
import { generateToken, verifyGoogleToken } from "../services/auth.service.js";
import User from "../models/User.js";

export const register = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "El correo ya está registrado" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            nombre,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        const token = generateToken(newUser._id, newUser.role);
        res.status(201).json({ token, role: newUser.role, nombre: newUser.nombre });

    } catch (error) {
        console.error("Error en registro:", error);
        res.status(500).json({ message: "Error al crear la cuenta" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || !user.password) {
            return res.status(400).json({ message: "Credenciales inválidas o cuenta de Google" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Credenciales inválidas" });
        }

        const token = generateToken(user._id, user.role);
        res.status(200).json({ token, role: user.role, nombre: user.nombre });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ message: "Error al iniciar sesión" });
    }
};

export const googleAuth = async (req, res) => {
    try {
        const { token } = req.body;
        
        const payload = await verifyGoogleToken(token);
        const { email, name, sub: googleId } = payload;

        let user = await User.findOne({ email });

        if (user) {
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        } else {
            user = new User({
                nombre: name,
                email,
                googleId,
                role: "user"
            });
            await user.save();
        }

        const appToken = generateToken(user._id, user.role);
        res.status(200).json({ token: appToken, role: user.role, nombre: user.nombre });

    } catch (error) {
        console.error("Error en Google Auth:", error);
        res.status(401).json({ message: "Autenticación de Google fallida" });
    }
};