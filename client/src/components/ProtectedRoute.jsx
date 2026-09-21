import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/admin/login" replace />;
    }

    try {
        // Decode JWT payload (part 2 of token header.payload.signature)
        const payloadBase64 = token.split('.')[1];
        if (!payloadBase64) throw new Error("Invalid Token Structure");
        
        const decodedPayload = JSON.parse(atob(payloadBase64));

        // 1. Expiration check
        if (decodedPayload.exp && decodedPayload.exp * 1000 < Date.now()) {
            console.warn("[ProtectedRoute] Admin session expired");
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return <Navigate to="/admin/login" replace />;
        }

        // 2. Strict Role & Username verification
        const isAdmin = decodedPayload.role === 'admin' || 
                        decodedPayload.username?.toLowerCase() === 'alvirothefinedining@gmail.com';

        if (!isAdmin) {
            console.warn("[ProtectedRoute] Non-admin attempted direct access");
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return <Navigate to="/admin/login" replace />;
        }
    } catch (err) {
        console.error("[ProtectedRoute] Token verification error:", err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return <Navigate to="/admin/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
