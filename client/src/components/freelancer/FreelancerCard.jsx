import { useNavigate } from 'react-router-dom';
import './FreelancerCard.css';

const FreelancerCard = ({ freelancer }) => {
    const navigate = useNavigate();

    const handleMessage = (e) => {
        e.stopPropagation(); // Prevent triggering the card click
        navigate(`/messages/${freelancer._id}`);
    };

    return (
        <div className="freelancer-card">
            <div className="card-header">
                <div className="profile-section">
                    <div className="profile-avatar">
                        {freelancer.name?.charAt(0).toUpperCase() || 'F'}
                    </div>
                    <div className="profile-info">
                        <h3>{freelancer.name}</h3>
                        {freelancer.verified && (
                            <span className="verified-badge">
                                ✓ Verified
                            </span>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="card-section">
                <p className="section-title">Skills:</p>
                <div className="skills-container">
                    {freelancer.skills?.map((skill, index) => (
                        <span 
                            key={index} 
                            className="skill-badge"
                        >
                            {skill}
                        </span>
                    ))}
                    {(!freelancer.skills || freelancer.skills.length === 0) && 
                        <span className="no-skills">No skills listed</span>
                    }
                </div>
            </div>

            {freelancer.portfolio && freelancer.portfolio.length > 0 && (
                <div className="card-section">
                    <p className="section-title">Portfolio:</p>
                    {freelancer.portfolio?.slice(0, 2).map((item, index) => (
                        <div key={index} className="portfolio-item">
                            <h4>{item.title}</h4>
                            <p>{item.description}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="card-actions">
                <button 
                    onClick={() => navigate(`/freelancers/${freelancer._id}`)}
                    className="view-profile-btn"
                >
                    View Profile
                </button>
                <button
                    onClick={handleMessage}
                    className="message-btn"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="message-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Message
                </button>
            </div>
        </div>
    );
};

export default FreelancerCard;