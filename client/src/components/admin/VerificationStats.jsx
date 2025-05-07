import React from 'react';
import './AdminVerification.css';

const VerificationStats = ({ stats, loading }) => {
    // Helper function to get count for a specific status
    const getStatusCount = (status) => {
        if (loading || !stats.statusStats) return '...';
        
        const statusItem = stats.statusStats.find(item => item.status === status);
        return statusItem ? statusItem.count : 0;
    };

    // Helper function to get count for a specific verification level
    const getLevelCount = (level) => {
        if (loading || !stats.levelStats) return '...';
        
        const levelItem = stats.levelStats.find(item => item.level === level);
        return levelItem ? levelItem.count : 0;
    };

    return (
        <div className="admin-stats">
            {/* Status Statistics */}
            <div className="stat-card">
                <h3 className="stat-title">Pending Verifications</h3>
                <p className="stat-value">{getStatusCount('pending')}</p>
            </div>
            <div className="stat-card">
                <h3 className="stat-title">Verified Freelancers</h3>
                <p className="stat-value">{getStatusCount('verified')}</p>
            </div>
            <div className="stat-card">
                <h3 className="stat-title">Rejected Verifications</h3>
                <p className="stat-value">{getStatusCount('rejected')}</p>
            </div>
            <div className="stat-card">
                <h3 className="stat-title">Unverified Freelancers</h3>
                <p className="stat-value">{getStatusCount('unverified')}</p>
            </div>
            
            {/* Level Statistics */}
            <div className="stat-card">
                <h3 className="stat-title">Basic Level</h3>
                <p className="stat-value">{getLevelCount('basic')}</p>
            </div>
            <div className="stat-card">
                <h3 className="stat-title">Verified Level</h3>
                <p className="stat-value">{getLevelCount('verified')}</p>
            </div>
            <div className="stat-card">
                <h3 className="stat-title">Premium Level</h3>
                <p className="stat-value">{getLevelCount('premium')}</p>
            </div>
        </div>
    );
};

export default VerificationStats;