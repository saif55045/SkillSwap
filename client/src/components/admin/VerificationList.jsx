import React, { useState, useEffect } from 'react';
import { adminService } from '../../utils/adminService';
import './AdminVerification.css';

const VerificationList = ({ status, onSelectFreelancer }) => {
    const [freelancers, setFreelancers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFreelancers();
    }, [status]);

    const fetchFreelancers = async () => {
        try {
            setLoading(true);
            const response = await adminService.getFreelancersByStatus(status);
            setFreelancers(response.data || []);
            setError(null);
        } catch (err) {
            console.error(`Error fetching ${status} freelancers:`, err);
            setError(`Failed to load ${status} freelancers`);
            setFreelancers([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        return `status-badge status-${status}`;
    };

    const getLevelBadgeClass = (level) => {
        return `level-badge level-${level}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Empty State - No freelancers with the current status
    if (!loading && freelancers.length === 0) {
        return (
            <div className="verification-list">
                <div className="verification-list-header">
                    <h2 className="verification-list-title">
                        {status.charAt(0).toUpperCase() + status.slice(1)} Freelancers
                    </h2>
                </div>
                <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <p className="empty-state-text">No freelancers with {status} status</p>
                </div>
            </div>
        );
    }

    // Loading State
    if (loading) {
        return (
            <div className="verification-list">
                <div className="verification-list-header">
                    <h2 className="verification-list-title">
                        {status.charAt(0).toUpperCase() + status.slice(1)} Freelancers
                    </h2>
                </div>
                <div className="empty-state">
                    <p className="empty-state-text">Loading...</p>
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="verification-list">
                <div className="verification-list-header">
                    <h2 className="verification-list-title">
                        {status.charAt(0).toUpperCase() + status.slice(1)} Freelancers
                    </h2>
                </div>
                <div className="empty-state" style={{ color: 'red' }}>
                    <p className="empty-state-text">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="verification-list">
            <div className="verification-list-header">
                <h2 className="verification-list-title">
                    {status.charAt(0).toUpperCase() + status.slice(1)} Freelancers
                    {freelancers.length > 0 && ` (${freelancers.length})`}
                </h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table className="verification-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Status</th>
                            {status === 'verified' && <th>Level</th>}
                            <th>Documents</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {freelancers.map((freelancer) => (
                            <tr key={freelancer._id}>
                                <td>{freelancer.name}</td>
                                <td>{freelancer.email}</td>
                                <td>
                                    <span className={getStatusBadgeClass(freelancer.verificationStatus)}>
                                        {freelancer.verificationStatus}
                                    </span>
                                </td>
                                {status === 'verified' && (
                                    <td>
                                        <span className={getLevelBadgeClass(freelancer.verificationLevel)}>
                                            {freelancer.verificationLevel}
                                        </span>
                                    </td>
                                )}
                                <td>{(freelancer.verificationDocuments || []).length}</td>
                                <td>{formatDate(freelancer.updatedAt)}</td>
                                <td>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => onSelectFreelancer(freelancer)}
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VerificationList;