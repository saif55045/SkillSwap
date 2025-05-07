import React, { useState, useEffect } from 'react';
import { reviewService } from '../../utils/reviewService';
import StarRating from './StarRating';
import ReviewCard from './ReviewCard';
import toast from 'react-hot-toast';
import '../reviews/Reviews.css';

const FreelancerReviews = ({ freelancerId, includeForm = false }) => {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        rating: '',
        sort: '-createdAt'
    });

    // Load reviews
    useEffect(() => {
        fetchReviews();
    }, [freelancerId, filters]);

    const fetchReviews = async () => {
        if (!freelancerId) return;
        
        try {
            setLoading(true);
            const result = await reviewService.getFreelancerReviews(freelancerId, {
                rating: filters.rating,
                sort: filters.sort
            });
            
            setReviews(result.reviews);
            setStats(result.stats);
        } catch (err) {
            setError('Failed to load reviews');
            toast.error('Failed to load reviews');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Handle review update (usually after freelancer adds a response)
    const handleReviewUpdate = (updatedReview) => {
        setReviews(prev => 
            prev.map(review => 
                review._id === updatedReview._id ? updatedReview : review
            )
        );
    };

    // Handle review deletion
    const handleReviewDelete = (reviewId) => {
        setReviews(prev => prev.filter(review => review._id !== reviewId));
        // Refresh stats after deletion
        fetchReviews();
    };

    // Handle new review submitted (when includeForm=true)
    const handleNewReview = (newReview) => {
        setReviews(prev => [newReview, ...prev]);
        fetchReviews(); // Refresh to get updated stats
    };

    return (
        <div className="reviews-container">
            <h2 className="section-title">Reviews & Ratings</h2>
            
            {/* Rating Summary */}
            <div className="rating-summary">
                <div className="rating-summary-header">
                    <div className="average-rating">{stats.averageRating.toFixed(1)}</div>
                    <div>
                        <StarRating value={Math.round(stats.averageRating)} readonly size="large" />
                        <div className="total-reviews">
                            Based on {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Filters */}
            <div className="review-filters">
                <div className="filter-item">
                    <span className="filter-label">Filter by:</span>
                    <select
                        name="rating"
                        value={filters.rating}
                        onChange={handleFilterChange}
                        className="filter-select"
                    >
                        <option value="">All Ratings</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                    </select>
                </div>
                
                <div className="filter-item">
                    <span className="filter-label">Sort by:</span>
                    <select
                        name="sort"
                        value={filters.sort}
                        onChange={handleFilterChange}
                        className="filter-select"
                    >
                        <option value="-createdAt">Most Recent</option>
                        <option value="createdAt">Oldest First</option>
                        <option value="-rating">Highest Rating</option>
                        <option value="rating">Lowest Rating</option>
                    </select>
                </div>
            </div>
            
            {/* Review List */}
            <div className="review-list">
                {loading ? (
                    <div className="text-center" style={{ padding: '20px' }}>
                        Loading reviews...
                    </div>
                ) : error ? (
                    <div className="text-center" style={{ padding: '20px', color: 'red' }}>
                        {error}
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">★</div>
                        <p>No reviews yet</p>
                    </div>
                ) : (
                    reviews.map(review => (
                        <ReviewCard
                            key={review._id}
                            review={review}
                            onUpdate={handleReviewUpdate}
                            onDelete={handleReviewDelete}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default FreelancerReviews;