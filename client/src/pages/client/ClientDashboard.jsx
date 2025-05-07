import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FreelancerSearch from './FreelancerSearch';
import ProjectForm from '../../components/client/ProjectForm';
import ProjectList from '../../components/client/ProjectList';
import { bidService } from '../../utils/bidService';
import toast from 'react-hot-toast';
import CounterOfferModal from '../../components/client/CounterOfferModal';

const ClientDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('projects');
    const [showProjectForm, setShowProjectForm] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'edit', 'view'
    const [projectBids, setProjectBids] = useState([]);
    const [loadingBids, setLoadingBids] = useState(false);
    const [selectedBid, setSelectedBid] = useState(null);
    const [showCounterOfferModal, setShowCounterOfferModal] = useState(false);

    const handleCreateProject = () => {
        setSelectedProject(null);
        setViewMode('create');
    };

    const handleEditProject = (project) => {
        setSelectedProject(project);
        setViewMode('edit');
    };

    const handleViewProject = async (project) => {
        // Navigate to the dedicated project details page instead of changing view mode
        navigate(`/client/projects/${project._id}`);
    };

    const handleProjectSubmit = () => {
        setViewMode('list');
        setSelectedProject(null);
    };

    const handleCancel = () => {
        setViewMode('list');
        setSelectedProject(null);
        setProjectBids([]);
    };

    const handleBidStatusUpdate = async (bidId, status) => {
        try {
            await bidService.updateBidStatus(bidId, status);
            toast.success(`Bid ${status === 'accepted' ? 'accepted' : 'rejected'}!`);
            
            // Refresh bids after status update
            if (selectedProject && selectedProject._id) {
                const bids = await bidService.getProjectBids(selectedProject._id);
                setProjectBids(Array.isArray(bids) ? bids : []);
            }
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
            
            // Refresh bids after submitting counter offer
            if (selectedProject && selectedProject._id) {
                const bids = await bidService.getProjectBids(selectedProject._id);
                setProjectBids(Array.isArray(bids) ? bids : []);
            }
        } catch (error) {
            toast.error(error.message || 'Error submitting counter offer');
            console.error('Counter offer error:', error);
        }
    };

    const handleNavigateToMessages = () => {
        navigate('/messages');
    };
    
    const handleNavigateToAnalytics = () => {
        navigate('/client/analytics');
    };

    return (
        <div>
            <header className="nav-header">
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>SkillSwap</h1>
                    <div>
                        <span style={{ marginRight: '1rem' }}>Welcome, {user.name}</span>
                        <button onClick={logout} className="btn btn-danger">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="container">
                <div style={{ marginTop: '1rem', marginBottom: '2rem' }}>
                    <button
                        className={`btn ${activeTab === 'projects' ? 'btn-primary' : ''}`}
                        onClick={() => setActiveTab('projects')}
                        style={{ marginRight: '1rem' }}
                    >
                        My Projects
                    </button>
                    <button
                        className={`btn ${activeTab === 'search' ? 'btn-primary' : ''}`}
                        onClick={() => setActiveTab('search')}
                        style={{ marginRight: '1rem' }}
                    >
                        Find Freelancers
                    </button>
                    <button
                        className="btn"
                        onClick={handleNavigateToMessages}
                        style={{ marginRight: '1rem' }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            Messages
                        </span>
                    </button>
                    <button
                        className="btn"
                        onClick={handleNavigateToAnalytics}
                    >
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Analytics
                        </span>
                    </button>
                </div>

                {activeTab === 'projects' ? (
                    <div className="projects-container">
                        {viewMode === 'list' && (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h2>My Projects</h2>
                                    <button
                                        onClick={handleCreateProject}
                                        className="btn btn-primary"
                                    >
                                        Create New Project
                                    </button>
                                </div>
                                <ProjectList
                                    onEdit={handleEditProject}
                                    onView={handleViewProject}
                                />
                            </>
                        )}

                        {(viewMode === 'create' || viewMode === 'edit') && (
                            <ProjectForm
                                project={selectedProject}
                                onSubmit={handleProjectSubmit}
                                onCancel={handleCancel}
                            />
                        )}

                        {viewMode === 'view' && selectedProject && (
                            <div className="project-details">
                                <h2>{selectedProject.title}</h2>
                                <div className="project-info">
                                    <p><strong>Category:</strong> {selectedProject.category}</p>
                                    <p><strong>Status:</strong> {selectedProject.status}</p>
                                    <p><strong>Budget:</strong> ${selectedProject.minBudget} - ${selectedProject.maxBudget}</p>
                                    <p><strong>Deadline:</strong> {new Date(selectedProject.deadline).toLocaleDateString()}</p>
                                </div>
                                <div className="project-description">
                                    <h3>Description</h3>
                                    <p>{selectedProject.description}</p>
                                </div>
                                
                                {/* Only render requirements section if requirements array exists */}
                                {selectedProject.requirements && Array.isArray(selectedProject.requirements) && (
                                    <div className="project-requirements">
                                        <h3>Requirements</h3>
                                        <ul>
                                            {selectedProject.requirements.map((req, index) => (
                                                <li key={index}>{req}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                {/* Project Bids Section */}
                                <div className="project-bids mt-6">
                                    <h3 className="text-xl font-semibold mb-3">Proposals ({projectBids.length})</h3>
                                    
                                    {loadingBids ? (
                                        <div className="text-center py-4">
                                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                            <p className="mt-2">Loading proposals...</p>
                                        </div>
                                    ) : projectBids.length === 0 ? (
                                        <div className="bg-gray-50 p-4 rounded-md text-gray-500 text-center">
                                            No proposals received yet.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {projectBids.map(bid => (
                                                <div key={bid._id} className="bg-white p-4 border border-gray-200 rounded-md shadow-sm">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-medium">
                                                                {bid.freelancerId?.name || 'Freelancer'}
                                                            </p>
                                                            <p className="text-gray-600 text-sm">
                                                                Bid Amount: <span className="font-semibold text-green-600">${bid.amount}</span>
                                                            </p>
                                                            <p className="text-gray-600 text-sm">
                                                                Delivery Time: <span className="font-semibold">{bid.deliveryTime} days</span>
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                                bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                                bid.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                                bid.status === 'countered' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="mt-3">
                                                        <p className="text-sm text-gray-700">
                                                            <strong>Proposal:</strong> {bid.proposal}
                                                        </p>
                                                    </div>
                                                    
                                                    {/* Display counter offer if exists */}
                                                    {bid.counterOffer && (
                                                        <div className="mt-3 p-3 bg-blue-50 rounded-md">
                                                            <p className="text-sm font-semibold text-blue-700">Your Counter Offer</p>
                                                            <p className="text-sm">Amount: ${bid.counterOffer.amount}</p>
                                                            <p className="text-sm">Message: {bid.counterOffer.message}</p>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Action buttons for pending bids */}
                                                    {bid.status === 'pending' && (
                                                        <div className="mt-3 flex space-x-2">
                                                            <button
                                                                onClick={() => handleBidStatusUpdate(bid._id, 'accepted')}
                                                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                                            >
                                                                Accept
                                                            </button>
                                                            <button
                                                                onClick={() => handleBidStatusUpdate(bid._id, 'rejected')}
                                                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                                            >
                                                                Reject
                                                            </button>
                                                            <button
                                                                onClick={() => handleCounterOffer(bid)}
                                                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                                            >
                                                                Counter Offer
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mt-4">
                                    <button onClick={handleCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
                                        Back to Projects
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <FreelancerSearch />
                )}
            </div>
            
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

export default ClientDashboard;