import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import FreelancerVerification from '../../components/freelancer/FreelancerVerification';

const FreelancerVerificationPage = () => {
    const { user, loading } = useAuth();
    
    // Show loading while checking authentication
    if (loading) {
        return <div className="loading-container">Loading...</div>;
    }
    
    // Redirect if not logged in or not a freelancer
    if (!user || user.role !== 'freelancer') {
        return <Navigate to="/login" replace />;
    }
    
    return (
        <div>
            <FreelancerVerification />
        </div>
    );
};

export default FreelancerVerificationPage;