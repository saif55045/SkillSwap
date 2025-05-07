import React, { useState, useEffect } from 'react';
import { adminService } from '../../utils/adminService';
import './AdminVerification.css';

const VerificationDetails = ({ freelancerId, onClose, onActionComplete }) => {
    const [freelancer, setFreelancer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionInProgress, setActionInProgress] = useState(false);

    // Form state for approval/rejection
    const [verificationLevel, setVerificationLevel] = useState('basic');
    const [rejectionReason, setRejectionReason] = useState('');
    const [showApproveForm, setShowApproveForm] = useState(false);
    const [showRejectForm, setShowRejectForm] = useState(false);

    useEffect(() => {
        fetchFreelancerDetails();
    }, [freelancerId]);

    const fetchFreelancerDetails = async () => {
        try {
            setLoading(true);
            const response = await adminService.getFreelancerVerificationDetails(freelancerId);
            setFreelancer(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching freelancer details:', err);
            setError('Failed to load freelancer verification details');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveSubmit = async () => {
        try {
            setActionInProgress(true);
            await adminService.processVerification(freelancerId, {
                action: 'approve',
                verificationLevel
            });
            
            // Notify parent component of the action
            if (onActionComplete) {
                onActionComplete();
            }
            
            // Close the modal
            onClose();
        } catch (err) {
            console.error('Error approving freelancer:', err);
            setError('Failed to approve freelancer: ' + err.message);
        } finally {
            setActionInProgress(false);
        }
    };

    const handleRejectSubmit = async () => {
        if (!rejectionReason.trim()) {
            setError('Please provide a reason for rejection');
            return;
        }

        try {
            setActionInProgress(true);
            await adminService.processVerification(freelancerId, {
                action: 'reject',
                rejectionReason
            });
            
            // Notify parent component of the action
            if (onActionComplete) {
                onActionComplete();
            }
            
            // Close the modal
            onClose();
        } catch (err) {
            console.error('Error rejecting freelancer:', err);
            setError('Failed to reject freelancer: ' + err.message);
        } finally {
            setActionInProgress(false);
        }
    };

    const handleUpdateLevel = async (newLevel) => {
        try {
            setActionInProgress(true);
            await adminService.updateVerificationLevel(freelancerId, newLevel);
            
            // Refresh freelancer data
            fetchFreelancerDetails();
            
            // Notify parent component of the action
            if (onActionComplete) {
                onActionComplete();
            }
        } catch (err) {
            console.error('Error updating verification level:', err);
            setError('Failed to update verification level: ' + err.message);
        } finally {
            setActionInProgress(false);
        }
    };

    const getDocumentStatusClass = (status) => {
        return `status-badge status-${status === 'approved' ? 'verified' : status}`;
    };

    const getDocumentTypeLabel = (type) => {
        switch(type) {
            case 'id': return 'ID Document';
            case 'certificate': return 'Certificate';
            case 'portfolio': return 'Portfolio';
            case 'other': return 'Other Document';
            default: return type;
        }
    };

    if (loading) {
        return (
            <div className="modal-backdrop">
                <div className="modal">
                    <div className="modal-header">
                        <h2 className="modal-title">Verification Details</h2>
                        <button className="modal-close" onClick={onClose}>×</button>
                    </div>
                    <div className="modal-body">
                        <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !freelancer) {
        return (
            <div className="modal-backdrop">
                <div className="modal">
                    <div className="modal-header">
                        <h2 className="modal-title">Error</h2>
                        <button className="modal-close" onClick={onClose}>×</button>
                    </div>
                    <div className="modal-body">
                        <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>
                            {error}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-backdrop">
            <div className="modal">
                <div className="modal-header">
                    <h2 className="modal-title">Verification Details</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    {error && (
                        <div style={{ color: 'red', marginBottom: '20px', padding: '10px', backgroundColor: '#fee2e2', borderRadius: '4px' }}>
                            {error}
                        </div>
                    )}

                    {/* Freelancer Information */}
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ marginBottom: '10px' }}>Freelancer Information</h3>
                        <p><strong>Name:</strong> {freelancer.name}</p>
                        <p><strong>Email:</strong> {freelancer.email}</p>
                        <p>
                            <strong>Verification Status:</strong>&nbsp;
                            <span className={`status-badge status-${freelancer.verificationStatus}`}>
                                {freelancer.verificationStatus}
                            </span>
                        </p>
                        
                        {freelancer.verificationStatus === 'verified' && (
                            <p>
                                <strong>Verification Level:</strong>&nbsp;
                                <span className={`level-badge level-${freelancer.verificationLevel}`}>
                                    {freelancer.verificationLevel}
                                </span>
                            </p>
                        )}
                        
                        {freelancer.rejectionReason && (
                            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fee2e2', borderRadius: '4px' }}>
                                <strong>Rejection Reason:</strong> {freelancer.rejectionReason}
                            </div>
                        )}
                    </div>

                    {/* Verification Documents */}
                    <div>
                        <h3 style={{ marginBottom: '10px' }}>Verification Documents</h3>
                        
                        {freelancer.verificationDocuments && freelancer.verificationDocuments.length > 0 ? (
                            <div className="document-list">
                                {freelancer.verificationDocuments.map((document, index) => (
                                    <div key={index} className="document-item">
                                        <div className="document-info">
                                            <div className="document-icon">📄</div>
                                            <div>
                                                <div className="document-name">{document.filename}</div>
                                                <div className="document-type">{getDocumentTypeLabel(document.type)}</div>
                                            </div>
                                        </div>
                                        <div className="document-actions">
                                            <span className={getDocumentStatusClass(document.status)}>
                                                {document.status}
                                            </span>
                                            <a 
                                                href={document.fileUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="btn btn-secondary btn-sm"
                                            >
                                                View
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#666', fontStyle: 'italic' }}>No verification documents uploaded</p>
                        )}
                    </div>
                    
                    {/* Approval Form */}
                    {showApproveForm && freelancer.verificationStatus !== 'verified' && (
                        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                            <h3 style={{ marginBottom: '10px' }}>Approve Verification</h3>
                            
                            <div className="form-group">
                                <label className="form-label">Verification Level</label>
                                <select 
                                    className="form-select"
                                    value={verificationLevel} 
                                    onChange={(e) => setVerificationLevel(e.target.value)}
                                >
                                    <option value="basic">Basic</option>
                                    <option value="verified">Verified</option>
                                    <option value="premium">Premium</option>
                                </select>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button 
                                    className="btn btn-success" 
                                    onClick={handleApproveSubmit}
                                    disabled={actionInProgress}
                                >
                                    {actionInProgress ? 'Processing...' : 'Confirm Approval'}
                                </button>
                                <button 
                                    className="btn btn-secondary"
                                    onClick={() => setShowApproveForm(false)}
                                    disabled={actionInProgress}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* Rejection Form */}
                    {showRejectForm && freelancer.verificationStatus !== 'rejected' && (
                        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                            <h3 style={{ marginBottom: '10px' }}>Reject Verification</h3>
                            
                            <div className="form-group">
                                <label className="form-label">Rejection Reason</label>
                                <textarea 
                                    className="form-textarea"
                                    value={rejectionReason} 
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Provide a reason for rejection"
                                    required
                                />
                            </div>
                            
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button 
                                    className="btn btn-danger" 
                                    onClick={handleRejectSubmit}
                                    disabled={actionInProgress}
                                >
                                    {actionInProgress ? 'Processing...' : 'Confirm Rejection'}
                                </button>
                                <button 
                                    className="btn btn-secondary"
                                    onClick={() => setShowRejectForm(false)}
                                    disabled={actionInProgress}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Level Update Form for Already Verified Freelancers */}
                    {freelancer.verificationStatus === 'verified' && !showApproveForm && !showRejectForm && (
                        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                            <h3 style={{ marginBottom: '10px' }}>Update Verification Level</h3>
                            
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button 
                                    className={`btn ${freelancer.verificationLevel === 'basic' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => handleUpdateLevel('basic')}
                                    disabled={actionInProgress || freelancer.verificationLevel === 'basic'}
                                >
                                    Basic
                                </button>
                                <button 
                                    className={`btn ${freelancer.verificationLevel === 'verified' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => handleUpdateLevel('verified')}
                                    disabled={actionInProgress || freelancer.verificationLevel === 'verified'}
                                >
                                    Verified
                                </button>
                                <button 
                                    className={`btn ${freelancer.verificationLevel === 'premium' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => handleUpdateLevel('premium')}
                                    disabled={actionInProgress || freelancer.verificationLevel === 'premium'}
                                >
                                    Premium
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    {freelancer.verificationStatus === 'pending' && (
                        <>
                            {!showApproveForm && !showRejectForm && (
                                <>
                                    <button 
                                        className="btn btn-success" 
                                        onClick={() => {
                                            setShowApproveForm(true);
                                            setShowRejectForm(false);
                                            setError(null);
                                        }}
                                    >
                                        Approve
                                    </button>
                                    <button 
                                        className="btn btn-danger" 
                                        onClick={() => {
                                            setShowRejectForm(true);
                                            setShowApproveForm(false);
                                            setError(null);
                                        }}
                                    >
                                        Reject
                                    </button>
                                </>
                            )}
                        </>
                    )}
                    <button className="btn btn-secondary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default VerificationDetails;