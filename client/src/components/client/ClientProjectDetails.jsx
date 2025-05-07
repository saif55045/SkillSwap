import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../../utils/projectService';
import { bidService } from '../../utils/bidService';
import toast from 'react-hot-toast';
import CounterOfferModal from './CounterOfferModal';
import ProjectReview from '../reviews/ProjectReview';
import './ClientProjectDetails.css';

const ClientProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBid, setSelectedBid] = useState(null);
  const [showCounterOfferModal, setShowCounterOfferModal] = useState(false);

  useEffect(() => {
    loadProjectDetails();
    loadBids();
    // eslint-disable-next-line
  }, [id]);

  const loadProjectDetails = async () => {
    try {
      setLoading(true);
      const response = await projectService.getProjectById(id);
      console.log('Project details:', response); // Debug log for project
      console.log('Selected freelancer:', response.selectedFreelancer); // Debug log for selectedFreelancer
      setProject(response);
    } catch (error) {
      toast.error('Error loading project details');
      console.error('Project details error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBids = async () => {
    try {
      const response = await bidService.getProjectBids(id);
      console.log('Bids received:', response);
      
      // Handle both array and object with bids property formats
      if (Array.isArray(response)) {
        setBids(response);
      } else if (response && Array.isArray(response.bids)) {
        setBids(response.bids);
      } else {
        setBids([]);
        console.warn('Unexpected bid response format:', response);
      }
    } catch (error) {
      toast.error('Error loading bids');
      console.error('Bid loading error:', error);
      setBids([]);
    }
  };

  const handleBidStatusUpdate = async (bidId, status) => {
    try {
      await bidService.updateBidStatus(bidId, status);
      toast.success(`Bid ${status === 'accepted' ? 'accepted' : 'rejected'}!`);
      loadBids();
      loadProjectDetails();
    } catch (error) {
      toast.error(error.message || 'Error updating bid status');
    }
  };

  const handleCounterOffer = (bid) => {
    setSelectedBid(bid);
    setShowCounterOfferModal(true);
  };

  const handleSubmitCounterOffer = async (counterOfferData) => {
    if (!selectedBid) return;
    
    try {
      await bidService.createCounterOffer(selectedBid._id, counterOfferData);
      setShowCounterOfferModal(false);
      toast.success('Counter offer submitted successfully');
      loadBids(); // Refresh bids to show the updated status
    } catch (error) {
      toast.error(error.message || 'Error submitting counter offer');
      console.error('Counter offer error:', error);
    }
  };

  const handleMessageFreelancer = (freelancerId) => {
    navigate(`/messages/${freelancerId}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!project) {
    return <div className="error-message">Project not found</div>;
  }

  // Function to get status class name
  const getStatusClassName = (status) => {
    switch (status) {
      case 'open': return 'status-open';
      case 'in-progress': return 'status-inprogress';
      case 'completed': return 'status-completed';
      default: return 'status-cancelled';
    }
  };

  // Function to get bid status class name
  const getBidStatusClassName = (status) => {
    switch (status) {
      case 'accepted': return 'bid-status-accepted';
      case 'rejected': return 'bid-status-rejected';
      case 'countered': return 'bid-status-countered';
      default: return 'bid-status-pending';
    }
  };

  return (
    <div className="project-details-container">
      <div className="project-card">
        <h2 className="project-title">{project.title}</h2>
        <p className="project-description">{project.description}</p>
        <div className="project-details-grid">
          <div className="project-detail-item">
            <span className="project-detail-label">Budget:</span> ${project.minBudget} - ${project.maxBudget}
          </div>
          <div className="project-detail-item">
            <span className="project-detail-label">Duration:</span> {project.duration} days
          </div>
          <div className="project-detail-item">
            <span className="project-detail-label">Status:</span>
            <span className={`status-label ${getStatusClassName(project.status)}`}>
              {project.status}
            </span>
          </div>
        </div>
      </div>
      
      <div className="bids-container">
        <h3 className="bids-header">
          Bids <span className="bids-count">{bids.length}</span>
        </h3>
        
        {bids.length === 0 && <p className="no-bids-message">No bids yet.</p>}
        
        {bids.map((bid) => (
          <div key={bid._id} className="bid-card">
            <div className="bid-header">
              <div className="freelancer-info">
                <p className="freelancer-name">
                  {bid.freelancerId?.name || 'Unknown Freelancer'}
                </p>
                <p className="bid-date">Bid placed on {new Date(bid.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <button
                  onClick={() => handleMessageFreelancer(bid.freelancerId._id)}
                  className="message-button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="message-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Message
                </button>
              </div>
            </div>

            <div className="bid-details-grid">
              <div>
                <p className="bid-detail-label">Bid Amount</p>
                <p className="bid-detail-value">${bid.amount}</p>
              </div>
              <div>
                <p className="bid-detail-label">Delivery Time</p>
                <p className="bid-detail-value">{bid.deliveryTime} days</p>
              </div>
              <div>
                <p className="bid-detail-label">Status</p>
                <span className={`bid-status ${getBidStatusClassName(bid.status)}`}>
                  {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="bid-proposal">
              <p className="bid-proposal-label">Proposal</p>
              <p className="bid-proposal-text">{bid.proposal}</p>
            </div>
            
            {/* Display counter offer details if exists */}
            {bid.counterOffer && (
              <div className="counter-offer-container">
                <p className="counter-offer-title">Your Counter Offer</p>
                <div className="bid-details-grid">
                  <div>
                    <p className="bid-detail-label">Amount</p>
                    <p className="bid-detail-value">${bid.counterOffer.amount}</p>
                  </div>
                  <div>
                    <p className="bid-detail-label">Message</p>
                    <p className="bid-detail-value">{bid.counterOffer.message}</p>
                  </div>
                </div>
              </div>
            )}
            
            {bid.status === 'pending' && (
              <div className="bid-actions">
                <button
                  className="btn btn-accept"
                  onClick={() => handleBidStatusUpdate(bid._id, 'accepted')}
                >
                  Accept Bid
                </button>
                <button
                  className="btn btn-reject"
                  onClick={() => handleBidStatusUpdate(bid._id, 'rejected')}
                >
                  Reject
                </button>
                <button
                  className="btn btn-counter"
                  onClick={() => handleCounterOffer(bid)}
                >
                  Counter Offer
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      
      
      {/* Review Section for completed projects */}
      {project && project.status === 'completed' && project.selectedFreelancer && (
        <div className="review-section">
          <ProjectReview 
            projectId={id}
            freelancerId={project.selectedFreelancer._id || project.selectedFreelancer}
            projectTitle={project.title}
          />
        </div>
      )}
      
      {/* Counter Offer Modal */}
      {showCounterOfferModal && selectedBid && (
        <CounterOfferModal
          bid={selectedBid}
          onClose={() => setShowCounterOfferModal(false)}
          onSubmit={handleSubmitCounterOffer}
        />
      )}
    </div>
  );
};

export default ClientProjectDetails;