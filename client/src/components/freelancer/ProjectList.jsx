import { useState, useEffect } from 'react';
import { projectService } from '../../utils/projectService';
import { useNavigate } from 'react-router-dom';

const ProjectList = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        category: 'all',
        budget: 'all'
    });

    useEffect(() => {
        loadProjects();
    }, [filters]);

    const loadProjects = async () => {
        try {
            setLoading(true);
            // Use a try-catch to prevent errors if the API isn't ready yet
            try {
                const response = await projectService.getProjects(filters);

                setProjects(response.projects || []);
            } catch (err) {
                console.error('API error:', err);
            }
        } catch (error) {
            console.error('Error loading projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setFilters(prev => ({ ...prev, search: e.target.value }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const styles = {
        container: {
            padding: '20px'
        },
        filters: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#f5f5f5',
            borderRadius: '5px'
        },
        input: {
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            minWidth: '200px'
        },
        select: {
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ccc'
        },
        projectGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
        },
        projectCard: {
            border: '1px solid #e0e0e0',
            borderRadius: '5px',
            padding: '15px',
            backgroundColor: 'white'
        },
        projectHeader: {
            borderBottom: '1px solid #eee',
            marginBottom: '10px',
            paddingBottom: '10px'
        },
        projectTitle: {
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '5px'
        },
        budget: {
            margin: '10px 0',
            color: '#666'
        },
        status: {
            display: 'inline-block',
            padding: '3px 8px',
            borderRadius: '12px',
            backgroundColor: '#c8e6c9',
            color: '#388e3c',
            fontSize: '12px'
        },
        skills: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '5px',
            marginTop: '10px'
        },
        skill: {
            backgroundColor: '#e3f2fd',
            color: '#1976d2',
            padding: '3px 8px',
            borderRadius: '12px',
            fontSize: '12px'
        },
        buttonPrimary: {
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
        }
    };

    return (
        <div style={styles.container}>
            <h2>Available Projects</h2>

            {/* Search and Filters */}
            <div style={styles.filters}>
                <input
                    type="text"
                    placeholder="Search projects..."
                    value={filters.search}
                    onChange={handleSearchChange}
                    style={styles.input}
                />

                <select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    style={styles.select}
                >
                    <option value="all">All Categories</option>
                    <option value="web">Web Development</option>
                    <option value="mobile">Mobile Development</option>
                    <option value="design">Design</option>
                    <option value="writing">Writing</option>
                </select>

                <select
                    name="budget"
                    value={filters.budget}
                    onChange={handleFilterChange}
                    style={styles.select}
                >
                    <option value="all">All Budgets</option>
                    <option value="0-100">$0 - $100</option>
                    <option value="100-500">$100 - $500</option>
                    <option value="500-1000">$500 - $1000</option>
                    <option value="1000+">$1000+</option>
                </select>
            </div>

            {/* Projects List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading projects...</div>
            ) : projects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>No projects found matching your criteria</div>
            ) : (
                <div style={styles.projectGrid}>
                    {projects.map(project => (
                        <div key={project._id} style={styles.projectCard}>
                            <div style={styles.projectHeader}>
                                <div style={styles.projectTitle}>{project.title}</div>
                                <div>by {project.clientId.name}</div>
                            </div>

                            <div>{project.description}</div>

                            <div style={styles.budget}>
                                Budget: ${project.minBudget} - ${project.maxBudget}
                            </div>

                            <div>
                                Deadline : {project.createdAt ?
                                    new Date(new Date(project.createdAt).getTime() + (project.duration * 24 * 60 * 60 * 1000)).toLocaleDateString()
                                    : 'Unknown'}
                            </div>

                            <div style={{ marginTop: '10px' }}>
                                <span style={styles.status}>{project.status}</span>
                            </div>

                            <div style={styles.skills}>
                                {project.skills.map((skill, index) => (
                                    <span key={index} style={styles.skill}>{skill}</span>
                                ))}
                            </div>

                            <button
                                style={styles.buttonPrimary}
                                onClick={() => navigate(`/freelancer/projects/${project._id}`)}
                            >
                                Submit Proposal
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProjectList;