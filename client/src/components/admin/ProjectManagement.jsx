import { useState, useEffect } from 'react';
import './ProjectManagement.css';

const ProjectManagement = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [projectBids, setProjectBids] = useState([]);
    const [loadingBids, setLoadingBids] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        category: 'all',
        page: 1
    });
    const [stats, setStats] = useState({
        projectsByStatus: {},
        newProjects: 0,
        averageBidsPerProject: 0
    });
    const [totalPages, setTotalPages] = useState(1);

    // Fetch projects on component mount and when filters change
    useEffect(() => {
        fetchProjects();
        fetchProjectStats();
    }, [filters.page, filters.status, filters.category]);

    // Fetch filtered projects from the API
    const fetchProjects = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (filters.search) queryParams.append('search', filters.search);
            if (filters.status !== 'all') queryParams.append('status', filters.status);
            if (filters.category !== 'all') queryParams.append('category', filters.category);
            queryParams.append('page', filters.page);
            queryParams.append('limit', 10);

            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/admin/projects?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch projects');
            }

            const data = await response.json();
            setProjects(data.data);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.error('Error fetching projects:', err);
            setError('Failed to load projects. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch project statistics
    const fetchProjectStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/admin/projects/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch project statistics');
            }

            const data = await response.json();
            setStats(data.data);
        } catch (err) {
            console.error('Error fetching project stats:', err);
        }
    };

    // Fetch bids for a specific project
    const fetchProjectBids = async (projectId) => {
        try {
            setLoadingBids(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/admin/projects/${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch project bids');
            }

            const data = await response.json();
            setProjectBids(data.data.bids || []);
        } catch (err) {
            console.error('Error fetching bids:', err);
        } finally {
            setLoadingBids(false);
        }
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
    };

    // Handle search form submission
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchProjects();
    };

    // Handle status filter change
    const handleStatusFilter = (e) => {
        setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }));
    };

    // Handle category filter change
    const handleCategoryFilter = (e) => {
        setFilters(prev => ({ ...prev, category: e.target.value, page: 1 }));
    };

    // Handle pagination
    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    // Handle project selection for viewing details
    const handleSelectProject = (project) => {
        setSelectedProject(project);
        fetchProjectBids(project._id);
    };

    // Handle project status update
    const handleUpdateStatus = async (projectId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/admin/projects/${projectId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update project status');
            }

            // Update project in local state
            setProjects(projects.map(project => 
                project._id === projectId ? { ...project, status: newStatus } : project
            ));
            
            if (selectedProject && selectedProject._id === projectId) {
                setSelectedProject({ ...selectedProject, status: newStatus });
            }

            alert('Project status updated successfully');
            fetchProjectStats(); // Refresh statistics
        } catch (err) {
            console.error('Error updating project status:', err);
            alert('Failed to update project status. Please try again.');
        }
    };

    // Handle closing the project details panel
    const handleCloseDetails = () => {
        setSelectedProject(null);
        setProjectBids([]);
    };

    // Format date display
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="project-management-container">
            <div className="project-management-header">
                <h2>Project Management</h2>
                <p>Manage all projects on the SkillSwap platform</p>
            </div>

            {/* Project statistics */}
            <div className="project-stats-container">
                <div className="stat-card">
                    <h3>Open Projects</h3>
                    <div className="stat-value">{stats.projectsByStatus?.open || 0}</div>
                </div>
                <div className="stat-card">
                    <h3>In Progress</h3>
                    <div className="stat-value">{stats.projectsByStatus?.['in-progress'] || 0}</div>
                </div>
                <div className="stat-card">
                    <h3>Completed</h3>
                    <div className="stat-value">{stats.projectsByStatus?.completed || 0}</div>
                </div>
                <div className="stat-card">
                    <h3>New Projects (30d)</h3>
                    <div className="stat-value">{stats.newProjects || 0}</div>
                </div>
                <div className="stat-card">
                    <h3>Avg Bids per Project</h3>
                    <div className="stat-value">{stats.averageBidsPerProject?.toFixed(1) || 0}</div>
                </div>
            </div>

            {/* Search and filters */}
            <div className="project-filters-container">
                <form onSubmit={handleSearchSubmit} className="search-form">
                    <input
                        type="text"
                        placeholder="Search projects by title or description"
                        value={filters.search}
                        onChange={handleSearchChange}
                    />
                    <button type="submit">Search</button>
                </form>

                <div className="filter-controls">
                    <select 
                        value={filters.status} 
                        onChange={handleStatusFilter}
                        className="status-filter"
                    >
                        <option value="all">All Statuses</option>
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    
                    <select 
                        value={filters.category} 
                        onChange={handleCategoryFilter}
                        className="category-filter"
                    >
                        <option value="all">All Categories</option>
                        <option value="Web Development">Web Development</option>
                        <option value="Mobile Development">Mobile Development</option>
                        <option value="UI/UX Design">UI/UX Design</option>
                        <option value="Content Writing">Content Writing</option>
                        <option value="Digital Marketing">Digital Marketing</option>
                        <option value="Data Analysis">Data Analysis</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>

            {/* Project list and details section */}
            <div className="project-content-container">
                {/* Project list */}
                <div className="project-list-container">
                    {loading ? (
                        <div className="loading-message">Loading projects...</div>
                    ) : error ? (
                        <div className="error-message">{error}</div>
                    ) : (
                        <>
                            <table className="projects-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Client</th>
                                        <th>Budget</th>
                                        <th>Duration</th>
                                        <th>Status</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projects.map(project => (
                                        <tr key={project._id} className={project._id === selectedProject?._id ? 'selected' : ''}>
                                            <td>{project.title}</td>
                                            <td>{project.clientId?.name || 'Unknown'}</td>
                                            <td>${project.minBudget} - ${project.maxBudget}</td>
                                            <td>{project.duration} days</td>
                                            <td>
                                                <span className={`status-badge status-${project.status}`}>
                                                    {project.status}
                                                </span>
                                            </td>
                                            <td>{formatDate(project.createdAt)}</td>
                                            <td>
                                                <button 
                                                    className="view-button" 
                                                    onClick={() => handleSelectProject(project)}
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            <div className="pagination-controls">
                                <button 
                                    onClick={() => handlePageChange(filters.page - 1)}
                                    disabled={filters.page === 1}
                                >
                                    Previous
                                </button>
                                <span className="page-info">
                                    Page {filters.page} of {totalPages}
                                </span>
                                <button 
                                    onClick={() => handlePageChange(filters.page + 1)}
                                    disabled={filters.page === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Project details panel */}
                {selectedProject && (
                    <div className="project-details-panel">
                        <div className="details-header">
                            <h3>Project Details</h3>
                            <button className="close-button" onClick={handleCloseDetails}>×</button>
                        </div>
                        
                        <div className="project-details">
                            <div className="project-title-section">
                                <h4>{selectedProject.title}</h4>
                                <span className={`status-badge status-${selectedProject.status}`}>
                                    {selectedProject.status}
                                </span>
                            </div>
                            
                            <div className="detail-section">
                                <h5>Description</h5>
                                <p>{selectedProject.description}</p>
                            </div>
                            
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <span className="label">Client:</span>
                                    <span className="value">{selectedProject.clientId?.name || 'Unknown'}</span>
                                </div>
                                
                                <div className="detail-item">
                                    <span className="label">Budget:</span>
                                    <span className="value">${selectedProject.minBudget} - ${selectedProject.maxBudget}</span>
                                </div>
                                
                                <div className="detail-item">
                                    <span className="label">Duration:</span>
                                    <span className="value">{selectedProject.duration} days</span>
                                </div>
                                
                                <div className="detail-item">
                                    <span className="label">Created:</span>
                                    <span className="value">{formatDate(selectedProject.createdAt)}</span>
                                </div>
                                
                                {selectedProject.selectedFreelancer && (
                                    <div className="detail-item">
                                        <span className="label">Selected Freelancer:</span>
                                        <span className="value">{selectedProject.selectedFreelancer.name}</span>
                                    </div>
                                )}
                            </div>
                            
                            {selectedProject.skills && selectedProject.skills.length > 0 && (
                                <div className="detail-section">
                                    <h5>Required Skills</h5>
                                    <div className="skills-list">
                                        {selectedProject.skills.map((skill, index) => (
                                            <span key={index} className="skill-tag">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            <div className="status-update-section">
                                <h5>Update Status</h5>
                                <div className="status-buttons">
                                    <button 
                                        className={`status-button open ${selectedProject.status === 'open' ? 'active' : ''}`}
                                        onClick={() => handleUpdateStatus(selectedProject._id, 'open')}
                                        disabled={selectedProject.status === 'open'}
                                    >
                                        Open
                                    </button>
                                    <button 
                                        className={`status-button in-progress ${selectedProject.status === 'in-progress' ? 'active' : ''}`}
                                        onClick={() => handleUpdateStatus(selectedProject._id, 'in-progress')}
                                        disabled={selectedProject.status === 'in-progress'}
                                    >
                                        In Progress
                                    </button>
                                    <button 
                                        className={`status-button completed ${selectedProject.status === 'completed' ? 'active' : ''}`}
                                        onClick={() => handleUpdateStatus(selectedProject._id, 'completed')}
                                        disabled={selectedProject.status === 'completed'}
                                    >
                                        Completed
                                    </button>
                                    <button 
                                        className={`status-button cancelled ${selectedProject.status === 'cancelled' ? 'active' : ''}`}
                                        onClick={() => handleUpdateStatus(selectedProject._id, 'cancelled')}
                                        disabled={selectedProject.status === 'cancelled'}
                                    >
                                        Cancelled
                                    </button>
                                </div>
                            </div>
                            
                            {/* Project Bids Section */}
                            <div className="project-bids-section">
                                <h5>Bids ({projectBids.length})</h5>
                                
                                {loadingBids ? (
                                    <div className="loading-message">Loading bids...</div>
                                ) : projectBids.length === 0 ? (
                                    <div className="no-bids-message">No bids for this project yet.</div>
                                ) : (
                                    <div className="bids-list">
                                        {projectBids.map(bid => (
                                            <div className="bid-card" key={bid._id}>
                                                <div className="bid-header">
                                                    <div>
                                                        <span className="freelancer-name">{bid.freelancerId?.name || 'Unknown Freelancer'}</span>
                                                        <span className="bid-date">{formatDate(bid.createdAt)}</span>
                                                    </div>
                                                    <span className={`status-badge status-${bid.status}`}>
                                                        {bid.status}
                                                    </span>
                                                </div>
                                                
                                                <div className="bid-details">
                                                    <div className="bid-amount">
                                                        <span className="label">Amount:</span>
                                                        <span className="value">${bid.amount}</span>
                                                    </div>
                                                    <div className="delivery-time">
                                                        <span className="label">Delivery Time:</span>
                                                        <span className="value">{bid.deliveryTime} days</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="bid-proposal">
                                                    <span className="label">Proposal:</span>
                                                    <p>{bid.proposal}</p>
                                                </div>
                                                
                                                {bid.counterOffer && (
                                                    <div className="counter-offer">
                                                        <span className="label">Counter Offer:</span>
                                                        <div className="counter-offer-details">
                                                            <p><strong>Amount:</strong> ${bid.counterOffer.amount}</p>
                                                            <p><strong>Message:</strong> {bid.counterOffer.message}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectManagement;