import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { config } from '../utils/config.js';
import { User } from '../models/User.js';

dotenv.config();

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token not provided'
        });
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Invalid token',
            error: error.message
        });
    }
};

export const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Access denied. ${req.user.role} role is not authorized.` 
            });
        }

        next();
    };
};

export const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Admin role required'
            });
        }
        
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error checking admin status',
            error: error.message
        });
    }
};

// Aliasing the functions to match the imports in routes files
export const protect = authenticateToken;
export const authorize = authorizeRole;