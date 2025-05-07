import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useAuth();

    // Check if user is authenticated
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check if user has the required role
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Move toast outside of render using useEffect
        useEffect(() => {
            toast.error('You are not authorized to access this page');
        }, []);
        
        return <Navigate to={`/${user.role}/dashboard`} replace />;
    }

    return children;
};

export default ProtectedRoute;