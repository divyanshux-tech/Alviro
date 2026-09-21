import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = await Admin.findOne({ username });
        if (existingUser) return res.status(400).json({ message: "Admin already exists" });

        const hashedPassword = await bcrypt.hash(password, 12);
        const result = await Admin.create({ username, password: hashedPassword });

        const token = jwt.sign({ username: result.username, id: result._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ result, token });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const secret = process.env.JWT_SECRET || "alviro_secret_jwt_key_2026";

        const adminEmail = "alvirothefinedining@gmail.com";
        const adminPass = "alviro";

        // Strictly enforce Admin Credentials: alvirothefinedining@gmail.com / alviro
        if (username?.trim().toLowerCase() === adminEmail.toLowerCase() && password === adminPass) {
            const token = jwt.sign({ username: adminEmail, role: "admin" }, secret, { expiresIn: "24h" });
            return res.status(200).json({ 
                result: { username: adminEmail, role: "admin" }, 
                token 
            });
        }

        // Database Admin Lookup
        const existingUser = await Admin.findOne({ username: username?.trim().toLowerCase() });
        if (!existingUser) return res.status(401).json({ message: "Invalid Admin Credentials. Unauthorized access prohibited." });

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) return res.status(401).json({ message: "Invalid Admin Credentials. Unauthorized access prohibited." });

        const token = jwt.sign({ username: existingUser.username, id: existingUser._id }, secret, { expiresIn: "24h" });

        res.status(200).json({ result: existingUser, token });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};

