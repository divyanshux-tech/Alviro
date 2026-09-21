import jwt from 'jsonwebtoken';

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const secret = process.env.JWT_SECRET || "alviro_secret_jwt_key_2026";
        
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            if (token) {
                const decodedData = jwt.verify(token, secret);
                req.userId = decodedData?.id || decodedData?.username;
                req.user = decodedData;
            }
        }
        next();
    } catch (error) {
        console.log("[AuthMiddleware] Notice:", error.message);
        next(); // Allow proceed or handle gracefully
    }
};

export default auth;

