import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { bidService } from '../../utils/bidService';
import { projectService } from '../../utils/projectService';
import toast from 'react-hot-toast';

const ActiveProjects = () => {
    const { user } = useAuth();
    const [activeProjects, setActiveProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchActiveProjects();
    }, []);

    const fetchActiveProjects = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Get user ID from context or localStorage as fallback
            let userId = user?._id;
            
            // If user ID is not in context, try to get from localStorage
            if (!userId) {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    userId = parsedUser._id || parsedUser.id; // Try both common ID formats
                }
            }
            
            if (!userId) {
                console.error('No user ID available');
                setError('User information not available. Please log in again.');
                return;
            }
            
            // Get all bids by the current freelancer
            const bids = await bidService.getFreelancerBids(userId);
            
            // Filter bids to only include those that are accepted
            const acceptedBids = bids.filter(bid => bid.status === 'accepted');
            
            // Get full project details for each accepted bid
            const projectDetailsPromises = acceptedBids.map(bid => 
                projectService.getProjectById(bid.projectId._id || bid.projectId)
            );
            
            const projectResponses = await Promise.all(projectDetailsPromises);
            
            // Combine project details with bid information
            const activeProjectsData = acceptedBids.map((bid, index) => ({
                ...projectResponses[index],
                bid: bid
            }));
            
            setActiveProjects(activeProjectsData);
        } catch (err) {
            console.error('Error fetching active projects:', err);
            setError('Failed to load active projects. Please try again later.');
            
            // If API fails, use sample data for development
            if (process.env.NODE_ENV === 'development') {
                setActiveProjects(sampleActiveProjects);
            }
        } finally {
            setLoading(false);
        }
    };

    const calculateDeadline = (project) => {
        if (project.deadline) return new Date(project.deadline);
        if (project.startDate && project.duration) {
            return new Date(new Date(project.startDate).getTime() + project.duration * 24 * 60 * 60 * 1000);
        }
        return null;
    };

    const calculateProgress = (project) => {
        // First check if project has a progress field with a valid value
        if (typeof project.progress === 'number') {
            console.log(`Using stored progress value: ${project.progress}% for project ${project._id}`);
            return project.progress;
        }
        
        // Fallback to time-based calculation if no progress value exists
        console.log(`No progress value found for project ${project._id}, calculating based on time`);
        if (!project.startDate) return 0;
        const deadline = calculateDeadline(project) || new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
        const startDate = new Date(project.startDate);
        const today = new Date();
        const totalDays = Math.max(1, Math.ceil((deadline - startDate) / (1000 * 60 * 60 * 24)));
        const daysElapsed = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
        return Math.min(100, Math.max(0, Math.floor((daysElapsed / totalDays) * 100)));
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString();
    };

    const getTimeRemaining = (project) => {
        const deadline = calculateDeadline(project);
        if (!deadline) return 'No deadline set';
        const today = new Date();
        const daysRemaining = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
        if (daysRemaining < 0) return 'Overdue';
        if (daysRemaining === 0) return 'Due today';
        return `${daysRemaining} days remaining`;
    };

    // Sample active projects for fallback during development
    const sampleActiveProjects = [
        {
            _id: '1',
            title: 'E-commerce Website Development',
            description: 'Building an e-commerce platform with React and Node.js.',
            clientId: { name: 'John Client' },
            startDate: new Date(2025, 3, 10).toISOString(),
            duration: 60,
            progress: 40,
            status: 'in-progress',
            bid: { amount: 800 },
            deadline: new Date(new Date(2025, 3, 10).getTime() + 60 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            _id: '2',
            title: 'Company Logo Design',
            description: 'Create a modern logo for a tech startup.',
            clientId: { name: 'Sarah Client' },
            startDate: new Date(2025, 3, 20).toISOString(),
            duration: 20,
            progress: 80,
            status: 'in-progress',
            bid: { amount: 350 },
            deadline: new Date(new Date(2025, 3, 20).getTime() + 20 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            _id: '3',
            title: 'Blog Website Redesign',
            description: 'Our blog needs a fresh look. We need a developer to redesign our WordPress blog with a modern, responsive design that focuses on readability.',
            clientId: { name: 'Ali Client' },
            startDate: new Date(2025, 4, 1).toISOString(),
            duration: 30,
            progress: 0,
            status: 'completed',
            bid: { amount: 600 },
            deadline: new Date(new Date(2025, 4, 1).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    // Update project progress
    const handleUpdateProgress = async (projectId, progress) => {
        try {
            console.log(`Updating project ${projectId} progress to ${progress}%`);
            // Show loading indicator
            setLoading(true);
            
            // Call API to update progress
            await projectService.updateProjectProgress(projectId, progress);
            toast.success(`Progress updated to ${progress}%`);
            
            // Immediately update the local state with the new progress value
            setActiveProjects(prev => 
                prev.map(project => 
                    project._id === projectId 
                        ? { ...project, progress: progress } 
                        : project
                )
            );
            
            // Refresh data from server (optional, but ensures we have the latest data)
            await fetchActiveProjects();
        } catch (err) {
            console.error('Error updating project progress:', err);
            toast.error('Failed to update project progress');
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: {
            padding: '20px'
        },
        heading: {
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '20px'
        },
        projectList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        },
        projectCard: {
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: 'white'
        },
        projectHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start',
            marginBottom: '15px'
        },
        projectTitle: {
            fontSize: '18px',
            fontWeight: 'bold'
        },
        projectStatus: {
            display: 'inline-block',
            padding: '5px 10px',
            borderRadius: '20px',
            fontSize: '12px',
            backgroundColor: '#bbdefb',
            color: '#1976d2'
        },
        projectDescription: {
            marginBottom: '15px',
            color: '#555'
        },
        progressContainer: {
            marginBottom: '15px'
        },
        progressHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '5px'
        },
        progressBar: {
            height: '8px',
            backgroundColor: '#e0e0e0',
            borderRadius: '4px',
            overflow: 'hidden'
        },
        progressFill: {
            height: '100%',
            backgroundColor: '#2196f3'
        },
        detailsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px',
            marginBottom: '15px'
        },
        detailItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#666'
        },
        timeRemaining: {
            color: '#e65100'
        },
        actionsContainer: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '10px'
        },
        buttonPrimary: {
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
        },
        buttonSuccess: {
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Active Projects</h2>
            
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading active projects...</div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
                    {error}
                </div>
            ) : activeProjects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <h3 style={{ marginBottom: '10px' }}>No active projects found</h3>
                    <p style={{ color: '#666' }}>You don't have any active projects yet. Browse available projects and start bidding!</p>
                </div>
            ) : (
                <div style={styles.projectList}>
                    {activeProjects.map(project => {
                        const progress = calculateProgress(project);
                        
                        return (
                            <div key={project._id} style={styles.projectCard}>
                                <div style={styles.projectHeader}>
                                    <h3 style={styles.projectTitle}>{project.title}</h3>
                                    <span style={styles.projectStatus}>{project.status}</span>
                                </div>
                                
                                <div style={styles.projectDescription}>{project.description}</div>
                                
                                {/* Progress bar */}
                                <div style={styles.progressContainer}>
                                    <div style={styles.progressHeader}>
                                        <span>Progress</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div style={styles.progressBar}>
                                        <div style={{...styles.progressFill, width: `${progress}%`}}></div>
                                    </div>
                                </div>
                                
                                {/* Project details */}
                                <div style={styles.detailsGrid}>
                                    <div style={styles.detailItem}>
                                        <span>Start Date:</span>
                                        <span>{formatDate(project.startDate)}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span>Deadline:</span>
                                        <span>{formatDate(calculateDeadline(project))}</span>
                                    </div>
                                    <div style={{...styles.detailItem, ...styles.timeRemaining}}>
                                        <span>{getTimeRemaining(project)}</span>
                                    </div>
                                    <div style={styles.detailItem}>
                                        <span>Your Bid:</span>
                                        <span>${project.bid?.amount}</span>
                                    </div>
                                </div>
                                
                                {/* Actions */}
                                <div style={styles.actionsContainer}>
                                    <button 
                                        style={styles.buttonPrimary}
                                        onClick={() => window.location.href = `/freelancer/projects/${project._id}`}
                                    >
                                        View Details
                                    </button>
                                    <button 
                                        style={styles.buttonSuccess}
                                        onClick={() => {
                                            const newProgress = prompt('Enter progress percentage (0-100):', progress);
                                            if (newProgress !== null) {
                                                const progressValue = parseInt(newProgress);
                                                if (!isNaN(progressValue) && progressValue >= 0 && progressValue <= 100) {
                                                    handleUpdateProgress(project._id, progressValue);
                                                } else {
                                                    alert('Please enter a valid number between 0 and 100');
                                                }
                                            }
                                        }}
                                    >
                                        Update Progress
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ActiveProjects;