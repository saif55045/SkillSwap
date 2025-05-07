import React, { useState, useEffect, useRef } from 'react';
import { freelancerService } from '../../utils/freelancerService';
import toast from 'react-hot-toast';
import './FreelancerVerification.css';

const FreelancerVerification = () => {
    // State for verification status and documents
    const [verificationStatus, setVerificationStatus] = useState({
        status: 'unverified',
        level: 'none',
        documents: [],
        rejectionReason: ''
    });
    
    // State for file uploads
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);
    
    // State for loading and error handling
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    // Fetch verification status on component mount
    useEffect(() => {
        fetchVerificationStatus();
    }, []);
    
    const fetchVerificationStatus = async () => {
        try {
            setLoading(true);
            const response = await freelancerService.getVerificationStatus();
            setVerificationStatus(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching verification status:', err);
            setError('Failed to load verification status. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    // Handle file selection
    const handleFileSelect = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            addFiles(files);
        }
    };
    
    // Handle drag and drop
    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };
    
    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };
    
    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        
        if (e.dataTransfer.files.length > 0) {
            addFiles(e.dataTransfer.files);
        }
    };
    
    // Add files to the upload list
    const addFiles = (files) => {
        const newFiles = Array.from(files).map(file => ({
            file,
            type: 'id',
            name: file.name,
            size: file.size,
            id: Math.random().toString(36).substring(2, 9)
        }));
        
        setUploadedFiles(prev => [...prev, ...newFiles]);
    };
    
    // Handle file type change
    const handleFileTypeChange = (id, type) => {
        setUploadedFiles(prev => 
            prev.map(file => 
                file.id === id ? { ...file, type } : file
            )
        );
    };
    
    // Remove file from upload list
    const handleRemoveFile = (id) => {
        setUploadedFiles(prev => prev.filter(file => file.id !== id));
    };
    
    // Handle verification document submission
    const handleSubmitVerification = async () => {
        if (uploadedFiles.length === 0) {
            setError('Please upload at least one document for verification');
            return;
        }
        
        try {
            setUploading(true);
            setError(null);
            setSuccess(null);
            
            // Create FormData object
            const formData = new FormData();
            
            // Add document types individually rather than as a JSON string
            uploadedFiles.forEach((file, index) => {
                formData.append(`documentTypes[${index}]`, file.type);
            });
            
            // Add files to form data - use consistent naming
            uploadedFiles.forEach((file, index) => {
                formData.append(`documents`, file.file);
            });
            
            await freelancerService.requestVerification(formData);
            
            toast.success('Verification documents submitted successfully');
            setSuccess('Your verification request has been submitted and is pending review');
            setUploadedFiles([]);
            
            // Refresh verification status
            fetchVerificationStatus();
        } catch (err) {
            console.error('Error submitting verification documents:', err);
            setError(err.message || 'Failed to submit verification documents');
            toast.error('Failed to submit verification documents');
        } finally {
            setUploading(false);
        }
    };
    
    // Handle document deletion
    const handleDeleteDocument = async (documentId) => {
        try {
            await freelancerService.deleteVerificationDocument(documentId);
            toast.success('Document deleted successfully');
            
            // Refresh verification status
            fetchVerificationStatus();
        } catch (err) {
            console.error('Error deleting document:', err);
            toast.error('Failed to delete document');
        }
    };
    
    // Get document type label for display
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
            <div className="verification-container">
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    Loading verification status...
                </div>
            </div>
        );
    }
    
    return (
        <div className="verification-container">
            <div className="verification-header">
                <h2 className="verification-title">Verification Status</h2>
                <div className="verification-status">
                    <span className={`status-indicator ${verificationStatus.status}`}></span>
                    <span className="verification-status-text">{verificationStatus.status}</span>
                </div>
            </div>
            
            {/* Benefits of verification */}
            <div className="verification-benefits">
                <h3 className="benefits-title">Benefits of Getting Verified</h3>
                <ul className="benefits-list">
                    <li>Increased visibility in search results</li>
                    <li>Higher trust factor with potential clients</li>
                    <li>Access to premium projects</li>
                    <li>Higher acceptance rate on bids</li>
                    <li>Verified badge on your profile</li>
                </ul>
            </div>
            
            {/* Verification Levels */}
            <div>
                <h3 className="verification-title">Verification Levels</h3>
                <div className="verification-levels">
                    <div className={`verification-level-card ${verificationStatus.level === 'basic' ? 'active' : ''}`}>
                        <div className="level-name">Basic</div>
                        <p className="level-description">
                            Email verification and ID proof. Get a basic verification badge.
                        </p>
                    </div>
                    <div className={`verification-level-card ${verificationStatus.level === 'verified' ? 'active' : ''}`}>
                        <div className="level-name">Verified</div>
                        <p className="level-description">
                            Professional certificates and portfolio verification. Higher visibility in search.
                        </p>
                    </div>
                    <div className={`verification-level-card ${verificationStatus.level === 'premium' ? 'active' : ''}`}>
                        <div className="level-name">Premium</div>
                        <p className="level-description">
                            Complete professional verification. Highest trust level and exclusive benefits.
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Current verification details */}
            {verificationStatus.status === 'verified' && (
                <div className="verification-info">
                    <p>
                        <strong>Verification Level:</strong> {verificationStatus.level.charAt(0).toUpperCase() + verificationStatus.level.slice(1)}
                    </p>
                    <p>Your account is verified. You can now enjoy all the benefits of being a verified freelancer.</p>
                </div>
            )}
            
            {/* Rejection reason if applicable */}
            {verificationStatus.status === 'rejected' && verificationStatus.rejectionReason && (
                <div className="rejection-reason">
                    <div className="rejection-title">Reason for Rejection:</div>
                    <div className="rejection-text">{verificationStatus.rejectionReason}</div>
                </div>
            )}
            
            {/* Pending message */}
            {verificationStatus.status === 'pending' && (
                <div className="verification-info">
                    <p>Your verification is currently under review. This process typically takes 1-3 business days.</p>
                </div>
            )}
            
            {/* Uploaded Documents List */}
            {verificationStatus.documents && verificationStatus.documents.length > 0 && (
                <div className="document-list">
                    <h3 className="verification-title">Submitted Documents</h3>
                    {verificationStatus.documents.map((document, index) => (
                        <div key={index} className="document-item">
                            <div className="document-info">
                                <div className="document-icon">
                                    {document.type === 'id' ? '🪪' :
                                     document.type === 'certificate' ? '🎓' :
                                     document.type === 'portfolio' ? '📂' : '📄'}
                                </div>
                                <div>
                                    <div className="document-name">{document.filename}</div>
                                    <div className="document-type">{getDocumentTypeLabel(document.type)}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span className={`document-status ${document.status}`}>
                                    {document.status}
                                </span>
                                {/* Only show delete button if status is not verified or rejected */}
                                {verificationStatus.status !== 'verified' && (
                                    <div className="document-actions">
                                        <button 
                                            onClick={() => handleDeleteDocument(document._id)}
                                            disabled={verificationStatus.status === 'verified'}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Document Upload Section - Only show if not verified or rejected status */}
            {(verificationStatus.status === 'unverified' || verificationStatus.status === 'rejected') && (
                <div className="upload-container">
                    <h3 className="verification-title">Upload Verification Documents</h3>
                    
                    <div 
                        className={`upload-section ${dragOver ? 'drag-over' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="upload-title">Upload Documents</div>
                        <div className="upload-description">
                            Upload ID, certificates, or portfolio documents to verify your account.
                            <br />
                            Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 5MB)
                        </div>
                        
                        <div className="file-input-container">
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                className="file-input" 
                                onChange={handleFileSelect}
                                multiple
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            />
                            <div 
                                className="file-input-button"
                                onClick={() => fileInputRef.current.click()}
                            >
                                Choose Files
                            </div>
                            <p style={{ margin: '10px 0', color: '#6b7280', fontSize: '14px' }}>
                                or drop files here
                            </p>
                        </div>
                    </div>
                    
                    {/* Preview of files to be uploaded */}
                    {uploadedFiles.length > 0 && (
                        <div style={{ marginTop: '20px' }}>
                            <h4 style={{ marginBottom: '10px', fontSize: '16px' }}>Selected Documents</h4>
                            {uploadedFiles.map(file => (
                                <div key={file.id} className="selected-file">
                                    <div className="document-icon">
                                        {file.name.toLowerCase().endsWith('.pdf') ? '📄' :
                                         file.name.toLowerCase().match(/\.(jpg|jpeg|png)$/) ? '🖼️' :
                                         file.name.toLowerCase().match(/\.(doc|docx)$/) ? '📝' : '📁'}
                                    </div>
                                    <div className="selected-file-name">{file.name}</div>
                                    <select 
                                        className="file-type-select"
                                        value={file.type}
                                        onChange={(e) => handleFileTypeChange(file.id, e.target.value)}
                                        style={{ width: '150px', marginLeft: '10px' }}
                                    >
                                        <option value="id">ID Document</option>
                                        <option value="certificate">Certificate</option>
                                        <option value="portfolio">Portfolio</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <button 
                                        className="remove-file-button"
                                        onClick={() => handleRemoveFile(file.id)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            
                            <button 
                                className="submit-button"
                                onClick={handleSubmitVerification}
                                disabled={uploading || uploadedFiles.length === 0}
                                style={{ marginTop: '15px' }}
                            >
                                {uploading ? 'Uploading...' : 'Submit for Verification'}
                            </button>
                        </div>
                    )}
                    
                    {/* Error and success messages */}
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                </div>
            )}
        </div>
    );
};

export default FreelancerVerification;