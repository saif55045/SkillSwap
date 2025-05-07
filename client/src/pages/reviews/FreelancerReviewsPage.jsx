import React from 'react';
import { useParams } from 'react-router-dom';
import FreelancerReviews from '../../components/reviews/FreelancerReviews';
import { useAuth } from '../../context/AuthContext';

const FreelancerReviewsPage = () => {
    const { freelancerId } = useParams();
    const { user } = useAuth();

    // Check if the current user is viewing their own reviews
    const isOwnProfile = user && user.id === freelancerId;

    return (
        <div style={{ 
            maxWidth: '1000px', 
            margin: '20px auto', 
            padding: '0 20px'
        }}>
            <FreelancerReviews 
                freelancerId={freelancerId} 
            />
        </div>
    );
};

export default FreelancerReviewsPage;