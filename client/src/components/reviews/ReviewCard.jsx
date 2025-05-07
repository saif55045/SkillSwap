import React, { useState } from 'react';
import StarRating from './StarRating';
import { reviewService } from '../../utils/reviewService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import '../reviews/Reviews.css';

const ReviewCard = ({ review, onUpdate, onDelete }) => {
    const { user } = useAuth();
    const [showResponseForm, setShowResponseForm] = useState(false);
    const [response, setResponse] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Format date nicely
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Check if the current user can respond to this review
    // Updated logic to handle both object and string IDs
    const canRespond = () => {
        if (!user || !review) return false;
        
        const freelancerId = review.freelancerId?._id || review.freelancerId;
        const userId = user.id;
        
        // Debug logs
        console.log('User role:', user.role);
        console.log('User ID:', userId);
        console.log('Freelancer ID:', freelancerId);
        console.log('Has response:', !!review.freelancerResponse);
        
        return user.role === 'freelancer' && 
               userId === freelancerId && 
               !review.freelancerResponse;
    };

    // Check if the current user can edit/delete this review
    const canModify = () => {
        if (!user || !review) return false;
        
        const clientId = review.clientId?._id || review.clientId;
        return user.id === clientId;
    };

    const handleSubmitResponse = async (e) => {
        e.preventDefault();
        setError('');

        if (response.trim().length < 3) {
            setError('Response must be at least 3 characters long');
            return;
        }

        try {
            setIsSubmitting(true);
            const result = await reviewService.addFreelancerResponse(review._id, response);
            toast.success('Response added successfully');
            setShowResponseForm(false);
            setResponse('');
            
            // Notify parent component to update the review
            if (onUpdate) {
                onUpdate(result.review);
            }
        } catch (err) {
            setError(err.message || 'Failed to submit response');
            toast.error(err.message || 'Failed to submit response');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                await reviewService.deleteReview(review._id);
                toast.success('Review deleted successfully');
                
                // Notify parent component
                if (onDelete) {
                    onDelete(review._id);
                }
            } catch (err) {
                toast.error(err.message || 'Failed to delete review');
            }
        }
    };

    return (
        <div className="review-card">
            <div className="review-header">
                <div className="reviewer-info">
                    <span className="reviewer-name">{review.clientId?.name || 'Client'}</span>
                    <StarRating value={review.rating} readonly size="small" />
                </div>
                <span className="review-date">{formatDate(review.createdAt)}</span>
            </div>
            
            <div className="review-content">
                {review.comment}
            </div>
            
            {review.freelancerResponse && (
                <div className="freelancer-response">
                    <div className="response-header">
                        Freelancer's Response:
                    </div>
                    <div>{review.freelancerResponse}</div>
                </div>
            )}
            
            {canRespond() && !showResponseForm && (
                <div className="review-actions">
                    <button 
                        className="btn btn-primary"
                        onClick={() => setShowResponseForm(true)}
                    >
                        Respond to Review
                    </button>
                </div>
            )}
            
            {canModify() && (
                <div className="review-actions">
                    <button 
                        className="btn btn-danger"
                        onClick={handleDelete}
                    >
                        Delete Review
                    </button>
                </div>
            )}
            
            {showResponseForm && (
                <form className="response-form" onSubmit={handleSubmitResponse}>
                    <h4 style={{ marginBottom: '10px' }}>Your Response</h4>
                    
                    {error && (
                        <div style={{ color: 'red', marginBottom: '10px' }}>
                            {error}
                        </div>
                    )}
                    
                    <div className="form-group">
                        <textarea
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            placeholder="Write your response to this review..."
                            className="form-textarea"
                            minLength={3}
                            maxLength={500}
                            required
                        />
                        <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                            {500 - response.length} characters remaining
                        </small>
                    </div>
                    
                    <div className="review-actions">
                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Response'}
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowResponseForm(false);
                                setResponse('');
                                setError('');
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ReviewCard;