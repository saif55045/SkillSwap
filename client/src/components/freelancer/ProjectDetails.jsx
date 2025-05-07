import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../../utils/projectService';
import { bidService } from '../../utils/bidService';
import { useAuth } from '../../context/AuthContext';
import ProjectReview from '../reviews/ProjectReview';
import toast from 'react-hot-toast';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [myBids, setMyBids] = useState([]);
    const [hasBid, setHasBid] = useState(false);
    const [proposal, setProposal] = useState({
        amount: '',
        deliveryTime: '',
        proposal: ''
    });

    useEffect(() => {
        loadProjectDetails();
        loadMyBids();
    }, [id]);

    const loadProjectDetails = async () => {
        try {
            setLoading(true);
            const response = await projectService.getProjectById(id);
            setProject(response);
        } catch (error) {
            console.error('Error loading project details:', error);
            toast.error('Error loading project details');
        } finally {
            setLoading(false);
        }
    };

    const loadMyBids = async () => {
        try {
            if (!user || !user.id) return;

            const allBids = await bidService.getProjectBids(id);
            console.log('All bids for project:', allBids);

            const userBids = allBids.filter(bid =>
                bid.freelancerId._id === user.id || bid.freelancerId === user.id
            );

            console.log('My bids for this project:', userBids);

            if (userBids.length > 0) {
                setMyBids(userBids);
                setHasBid(true);
            }
        } catch (error) {
            console.error('Error loading your bids:', error);
        }
    };

    const handleSubmitProposal = async (e) => {
        e.preventDefault();
        try {
            await bidService.createBid(id, {
                amount: Number(proposal.amount),
                deliveryTime: Number(proposal.deliveryTime),
                proposal: proposal.proposal
            });
            toast.success('Proposal submitted successfully!');
            await loadMyBids();
        } catch (error) {
            console.error('Error submitting proposal:', error);
            toast.error(error.message || 'Error submitting proposal');
        }
    };

    const handleAcceptCounterOffer = async (bidId) => {
        try {
            await bidService.acceptCounterOffer(bidId);
            toast.success('Counter offer accepted successfully!');
            await loadMyBids();
        } catch (error) {
            console.error('Error accepting counter offer:', error);
            toast.error(error.message || 'Error accepting counter offer');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProposal(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleMessageClient = () => {
        if (project && project.clientId && project.clientId._id) {
            navigate(`/messages/${project.clientId._id}`);
        } else {
            toast.error("Cannot initiate conversation. Client info not available.");
        }
    };

    const styles = {
        container: {
            maxWidth: '800px',
            margin: '0 auto',
            padding: '20px'
        },
        header: {
            marginBottom: '20px'
        },
        title: {
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '10px'
        },
        details: {
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '5px',
            marginBottom: '20px'
        },
        form: {
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '5px',
            marginBottom: '20px'
        },
        input: {
            width: '100%',
            padding: '8px',
            marginBottom: '15px',
            borderRadius: '4px',
            border: '1px solid #ddd'
        },
        textarea: {
            width: '100%',
            padding: '8px',
            marginBottom: '15px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            minHeight: '150px'
        },
        button: {
            backgroundColor: '#1976d2',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
        },
        bidCard: {
            border: '1px solid #e0e0e0',
            borderRadius: '5px',
            padding: '15px',
            marginBottom: '15px',
            backgroundColor: '#f9f9f9'
        },
        bidStatus: (status) => ({
            display: 'inline-block',
            padding: '5px 10px',
            borderRadius: '15px',
            fontSize: '12px',
            fontWeight: 'bold',
            backgroundColor:
                status === 'accepted' ? '#c8e6c9' :
                status === 'rejected' ? '#ffcdd2' :
                status === 'countered' ? '#bbdefb' : '#fff9c4',
            color:
                status === 'accepted' ? '#2e7d32' :
                status === 'rejected' ? '#c62828' :
                status === 'countered' ? '#1565c0' : '#f57f17',
            marginBottom: '10px'
        }),
        counterOffer: {
            backgroundColor: '#e3f2fd',
            padding: '15px',
            borderRadius: '5px',
            marginTop: '10px',
            marginBottom: '10px',
            border: '1px dashed #2196f3'
        },
        acceptButton: {
            backgroundColor: '#4caf50',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
        },
        messageButton: {
            backgroundColor: '#ffffff',
            color: '#1976d2',
            border: '1px solid #1976d2',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
        }
    };

    if (loading) {
        return <div style={styles.container}>Loading project details...</div>;
    }

    if (!project) {
        return <div style={styles.container}>Project not found</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>{project.title}</h1>
                <p>Posted by {project.clientId.name}</p>
                <button style={styles.messageButton} onClick={handleMessageClient}>
                    <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Message Client
                </button>
            </div>

            <div style={styles.details}>
                <h2>Project Details</h2>
                <p>{project.description}</p>
                <p>Budget: ${project.minBudget} - ${project.maxBudget}</p>
                <p>Duration: {project.duration} days</p>
                <div>
                    <h3>Required Skills:</h3>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {project.skills.map((skill, index) => (
                            <span key={index} style={{
                                backgroundColor: '#e3f2fd',
                                color: '#1976d2',
                                padding: '5px 10px',
                                borderRadius: '15px',
                                fontSize: '14px'
                            }}>
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {myBids.length > 0 && (
                <div style={styles.form}>
                    <h2>Your Proposals</h2>
                    {myBids.map(bid => (
                        <div key={bid._id} style={styles.bidCard}>
                            <div style={styles.bidStatus(bid.status)}>
                                Status: {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                            </div>
                            <p><strong>Your Bid Amount:</strong> ${bid.amount}</p>
                            <p><strong>Delivery Time:</strong> {bid.deliveryTime} days</p>
                            <p><strong>Your Proposal:</strong> {bid.proposal}</p>

                            {bid.counterOffer && (
                                <div style={styles.counterOffer}>
                                    <h3>Counter Offer from Client</h3>
                                    <p><strong>Counter Offer Amount:</strong> ${bid.counterOffer.amount}</p>
                                    <p><strong>Message from Client:</strong> {bid.counterOffer.message}</p>
                                    <button
                                        style={styles.acceptButton}
                                        onClick={() => handleAcceptCounterOffer(bid._id)}
                                    >
                                        Accept Counter Offer
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {(!hasBid || myBids.every(bid => bid.status === 'rejected')) && (
                <form style={styles.form} onSubmit={handleSubmitProposal}>
                    <h2>Submit Your Proposal</h2>

                    <div>
                        <label>Bid Amount ($)</label>
                        <input
                            type="number"
                            name="amount"
                            value={proposal.amount}
                            onChange={handleInputChange}
                            style={styles.input}
                            required
                            min={project.minBudget}
                            max={project.maxBudget}
                        />
                    </div>

                    <div>
                        <label>Delivery Time (days)</label>
                        <input
                            type="number"
                            name="deliveryTime"
                            value={proposal.deliveryTime}
                            onChange={handleInputChange}
                            style={styles.input}
                            required
                            min="1"
                        />
                    </div>

                    <div>
                        <label>Proposal</label>
                        <textarea
                            name="proposal"
                            value={proposal.proposal}
                            onChange={handleInputChange}
                            style={styles.textarea}
                            required
                            placeholder="Describe why you're the best fit for this project..."
                            minLength={50}
                            maxLength={1000}
                        />
                    </div>

                    <button type="submit" style={styles.button}>
                        Submit Proposal
                    </button>
                </form>
            )}

            {project.status === 'completed' && project.selectedFreelancer && (
                <div style={{
                    marginTop: '30px',
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '5px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <ProjectReview 
                        projectId={id}
                        freelancerId={user.id}
                        projectTitle={project.title}
                    />
                </div>
            )}
        </div>
    );
};

export default ProjectDetails;