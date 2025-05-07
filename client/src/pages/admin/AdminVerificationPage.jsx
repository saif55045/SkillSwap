import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import VerificationDashboard from '../../components/admin/VerificationDashboard';

const AdminVerificationPage = () => {
    const { user, loading } = useAuth();

    // Show loading while checking authentication
    if (loading) {
        return <div className="loading-container">Loading...</div>;
    }

    // Redirect if not logged in or not an admin
    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" replace />;
    }

    return (
        <div>
            <VerificationDashboard />
        </div>
    );
};

export default AdminVerificationPage;