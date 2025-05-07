import { useState, useEffect } from 'react';
import { projectService } from '../../utils/projectService';
import toast from 'react-hot-toast';

const ProjectList = ({ onEdit, onView }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        category: '',
        search: '',
        page: 1
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 0,
        total: 0
    });

    const loadProjects = async (newPage = 1) => {
        setLoading(true);
        try {
            const response = await projectService.getProjects({
                ...filters,
                page: newPage
            });
            setProjects(response.projects);
            setPagination({
                currentPage: response.currentPage,
                totalPages: response.totalPages,
                total: response.total
            });
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProjects(filters.page);
    }, [filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value,
            page: 1 // Reset to first page when filter changes
        }));
    };

    const handleDelete = async (projectId) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await projectService.deleteProject(projectId);
                toast.success('Project deleted successfully');
                loadProjects(filters.page);
            } catch (error) {
                toast.error(error.message);
            }
        }
    };

    const handleStatusChange = async (projectId, newStatus) => {
        if (window.confirm(`Are you sure you want to change the project status to ${newStatus}?`)) {
            try {
                await projectService.changeProjectStatus(projectId, newStatus);
                toast.success('Project status updated successfully');
                loadProjects(filters.page);
            } catch (error) {
                toast.error(error.message);
            }
        }
    };

    const getAvailableStatuses = (currentStatus) => {
        const transitions = {
            'open': ['in-progress', 'cancelled'],
            'in-progress': ['completed', 'cancelled'],
            'completed': [],
            'cancelled': []
        };
        return transitions[currentStatus] || [];
    };

    const getStatusBadgeClass = (status) => {
        const classes = {
            'open': 'status-badge-open',
            'in-progress': 'status-badge-progress',
            'completed': 'status-badge-completed',
            'cancelled': 'status-badge-cancelled'
        };
        return classes[status] || '';
    };

    return (
        <div className="project-list">
            <div className="filters">
                <input
                    type="text"
                    name="search"
                    placeholder="Search projects..."
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="form-input"
                />

                <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="form-input"
                >
                    <option value="">All Status</option>
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>

                <select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="form-input"
                >
                    <option value="">All Categories</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Content Writing">Content Writing</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                    <option value="Data Analysis">Data Analysis</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : projects.length === 0 ? (
                <div>No projects found</div>
            ) : (
                <>
                    <div className="projects-grid">
                        {projects.map(project => (
                            <div key={project._id} className="project-card">
                                <div className="project-header">
                                    <h3>{project.title}</h3>
                                    <div className="status-section">
                                        <span className={`status-badge ${getStatusBadgeClass(project.status)}`}>
                                            {project.status}
                                        </span>
                                        {getAvailableStatuses(project.status).length > 0 && (
                                            <select
                                                className="status-select"
                                                onChange={(e) => handleStatusChange(project._id, e.target.value)}
                                                value=""
                                            >
                                                <option value="">Change Status</option>
                                                {getAvailableStatuses(project.status).map(status => (
                                                    <option key={status} value={status}>
                                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                </div>
                                
                                <p className="project-category">{project.category}</p>
                                <p className="project-description">{project.description.substring(0, 150)}...</p>
                                
                                <div className="project-details">
                                    <span>Budget: ${project.minBudget} - ${project.maxBudget}</span>
                                    <span>Duration: {project.duration} days</span>
                                </div>
                                <div className="skills-list" style={{ marginTop: '8px' }}>
                                    {project.skills.map((skill, index) => (
                                        <span key={index} className="skill-tag">
                                            {skill}
                                        </span>
                                    ))}
                                </div>

                                <div className="project-actions">
                                    <button 
                                        onClick={() => onView(project)} 
                                        className="btn"
                                    >
                                        View
                                    </button>
                                    {project.status === 'open' && (
                                        <>
                                            <button 
                                                onClick={() => onEdit(project)} 
                                                className="btn btn-primary"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(project._id)} 
                                                className="btn btn-danger"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {pagination.totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="btn"
                                disabled={pagination.currentPage === 1}
                                onClick={() => loadProjects(pagination.currentPage - 1)}
                            >
                                Previous
                            </button>
                            <span>
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </span>
                            <button
                                className="btn"
                                disabled={pagination.currentPage === pagination.totalPages}
                                onClick={() => loadProjects(pagination.currentPage + 1)}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ProjectList;