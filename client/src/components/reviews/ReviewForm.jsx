import React, { useState } from 'react';
import StarRating from './StarRating';
import { reviewService } from '../../utils/reviewService';
import toast from 'react-hot-toast';
import '../reviews/Reviews.css';

const ReviewForm = ({ projectId, freelancerId, onReviewSubmitted }) => {
    const [formData, setFormData] = useState({
        rating: 0,
        comment: '',
        isPublic: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRatingChange = (value) => {
        setFormData({ ...formData, rating: value });
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.rating === 0) {
            setError('Please select a rating');
            return;
        }

        if (formData.comment.trim().length < 3) {
            setError('Please provide a review comment (minimum 3 characters)');
            return;
        }

        try {
            setLoading(true);
            const reviewData = {
                projectId,
                freelancerId,
                ...formData
            };

            const result = await reviewService.createReview(reviewData);
            toast.success('Review submitted successfully!');
            
            // Reset form
            setFormData({ rating: 0, comment: '', isPublic: true });
            
            // Notify parent component that a review was submitted
            if (onReviewSubmitted) {
                onReviewSubmitted(result.review);
            }
        } catch (error) {
            setError(error.message || 'Failed to submit review');
            toast.error(error.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="review-form" onSubmit={handleSubmit}>
            <h3 className="section-title">Write a Review</h3>
            
            {error && <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
            
            <div className="form-group">
                <label className="form-label">Rating</label>
                <div>
                    <StarRating value={formData.rating} onChange={handleRatingChange} />
                    <span style={{ marginLeft: '10px' }}>
                        {formData.rating > 0 ? `${formData.rating} star${formData.rating !== 1 ? 's' : ''}` : 'Select a rating'}
                    </span>
                </div>
            </div>
            
            <div className="form-group">
                <label className="form-label" htmlFor="comment">Review</label>
                <textarea
                    id="comment"
                    name="comment"
                    value={formData.comment}
                    onChange={handleInputChange}
                    placeholder="Share your experience working with this freelancer..."
                    className="form-textarea"
                    required
                    minLength={3}
                    maxLength={500}
                />
                <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                    {500 - formData.comment.length} characters remaining
                </small>
            </div>
            
            <div className="form-checkbox-group">
                <input
                    type="checkbox"
                    id="isPublic"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                    className="form-checkbox"
                />
                <label htmlFor="isPublic">Make this review public on the freelancer's profile</label>
            </div>
            
            <div className="mt-20">
                <button 
                    type="submit" 
                    className="btn btn-submit"
                    disabled={loading}
                >
                    {loading ? 'Submitting...' : 'Submit Review'}
                </button>
            </div>
        </form>
    );
};

export default ReviewForm;