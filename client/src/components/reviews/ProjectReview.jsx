import React, { useState, useEffect } from 'react';
import { reviewService } from '../../utils/reviewService';
import { useAuth } from '../../context/AuthContext';
import ReviewForm from './ReviewForm';
import ReviewCard from './ReviewCard';
import toast from 'react-hot-toast';
import '../reviews/Reviews.css';

const ProjectReview = ({ projectId, freelancerId, projectTitle }) => {
    const { user } = useAuth();
    const [existingReview, setExistingReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProjectReviews();
    }, [projectId]);

    const fetchProjectReviews = async () => {
        try {
            setLoading(true);
            const reviews = await reviewService.getProjectReviews(projectId);
            
            // Check if current user (client) has already left a review
            const clientReview = reviews.find(
                review => review.clientId._id === user?.id
            );
            
            if (clientReview) {
                setExistingReview(clientReview);
            }
        } catch (err) {
            setError('Error loading project review');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReviewSubmitted = (newReview) => {
        setExistingReview(newReview);
        toast.success('Review submitted successfully!');
    };

    const handleReviewUpdate = (updatedReview) => {
        setExistingReview(updatedReview);
    };

    const handleReviewDelete = () => {
        setExistingReview(null);
        toast.success('Review deleted successfully');
    };

    // Check if user is the client for this project
    const isClient = user && user.role === 'client';

    if (loading) {
        return <div className="reviews-container">Loading review information...</div>;
    }

    return (
        <div className="reviews-container">
            <h2 className="section-title">Project Review</h2>
            
            {error && (
                <div style={{ color: 'red', marginBottom: '20px' }}>
                    {error}
                </div>
            )}

            {!existingReview && isClient ? (
                <div>
                    <p style={{ marginBottom: '20px' }}>
                        Share your feedback about working with this freelancer on the project: <strong>{projectTitle}</strong>
                    </p>
                    
                    <ReviewForm 
                        projectId={projectId} 
                        freelancerId={freelancerId}
                        onReviewSubmitted={handleReviewSubmitted}
                    />
                </div>
            ) : existingReview ? (
                <div>
                    <p style={{ marginBottom: '20px' }}>
                        Your review for this project:
                    </p>
                    
                    <ReviewCard 
                        review={existingReview}
                        onUpdate={handleReviewUpdate}
                        onDelete={handleReviewDelete}
                    />
                </div>
            ) : (
                <div className="empty-state">
                    <p>Only the client can leave a review for this project.</p>
                </div>
            )}
        </div>
    );
};

export default ProjectReview;