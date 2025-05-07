import React, { useState, useEffect } from 'react';
import { adminService } from '../../utils/adminService';
import VerificationStats from './VerificationStats';
import VerificationList from './VerificationList';
import VerificationDetails from './VerificationDetails';
import './AdminVerification.css';

const VerificationDashboard = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [stats, setStats] = useState({
        statusStats: [],
        levelStats: []
    });
    const [selectedFreelancer, setSelectedFreelancer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchVerificationStats();
    }, []);

    const fetchVerificationStats = async () => {
        try {
            setLoading(true);
            const response = await adminService.getVerificationStats();
            setStats(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching verification stats:', err);
            setError('Failed to load verification statistics');
        } finally {
            setLoading(false);
        }
    };

    const handleFreelancerSelect = (freelancer) => {
        setSelectedFreelancer(freelancer);
    };

    const handleCloseDetails = () => {
        setSelectedFreelancer(null);
        // Refresh stats after closing details (in case of approval/rejection)
        fetchVerificationStats();
    };

    const getPendingCount = () => {
        const pendingStat = stats.statusStats.find(stat => stat.status === 'pending');
        return pendingStat ? pendingStat.count : 0;
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1 className="admin-title">Freelancer Verification Management</h1>
            </div>

            {/* Stats Overview */}
            <VerificationStats stats={stats} loading={loading} />

            {/* Tabs for different verification statuses */}
            <div className="admin-tabs">
                <button
                    className={`admin-tab ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Pending ({getPendingCount()})
                </button>
                <button
                    className={`admin-tab ${activeTab === 'verified' ? 'active' : ''}`}
                    onClick={() => setActiveTab('verified')}
                >
                    Verified
                </button>
                <button
                    className={`admin-tab ${activeTab === 'rejected' ? 'active' : ''}`}
                    onClick={() => setActiveTab('rejected')}
                >
                    Rejected
                </button>
                <button
                    className={`admin-tab ${activeTab === 'unverified' ? 'active' : ''}`}
                    onClick={() => setActiveTab('unverified')}
                >
                    Unverified
                </button>
            </div>

            {/* Freelancer List by Status */}
            <VerificationList
                status={activeTab}
                onSelectFreelancer={handleFreelancerSelect}
                onActionComplete={fetchVerificationStats}
            />

            {/* Freelancer Verification Details Modal */}
            {selectedFreelancer && (
                <VerificationDetails
                    freelancerId={selectedFreelancer._id}
                    onClose={handleCloseDetails}
                    onActionComplete={fetchVerificationStats}
                />
            )}
        </div>
    );
};

export default VerificationDashboard;