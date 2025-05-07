import { useState, useEffect } from 'react';
import { freelancerService } from '../../utils/freelancerService';
import FreelancerCard from '../../components/freelancer/FreelancerCard';
import toast from 'react-hot-toast';
import './FreelancerSearch.css';

const FreelancerSearch = () => {
    const [freelancers, setFreelancers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        searchTerm: '',
        skills: [],
        verificationStatus: '',
        page: 1
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 0,
        total: 0
    });

    // Available skills for filtering
    const availableSkills = [
        'React', 'Node.js', 'UI/UX', 'Graphic Design',
        'Content Writing', 'Copywriting', 'Blog Writing', 'Mobile Development', 
        'Python', 'Digital Marketing'
    ];

    const handleSearch = async (newPage = 1) => {
        setLoading(true);
        try {
            const params = {
                ...filters,
                page: newPage,
                skills: filters.skills.join(',')
            };
            
            const response = await freelancerService.searchFreelancers(params);
            setFreelancers(response.freelancers);
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

    const handleSkillToggle = (skill) => {
        setFilters(prev => ({
            ...prev,
            skills: prev.skills.includes(skill)
                ? prev.skills.filter(s => s !== skill)
                : [...prev.skills, skill]
        }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Debounce search term changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch(1);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [filters.searchTerm, filters.skills, filters.verificationStatus]);

    return (
        <div className="freelancer-search-container">
            <h2 className="search-heading">Find Freelancers</h2>
            
            <div className="search-filter-panel">
                <div className="search-filter-grid">
                    <div className="search-filter-item">
                        <label className="filter-label">Search</label>
                        <input
                            type="text"
                            name="searchTerm"
                            placeholder="Search by name or skills..."
                            value={filters.searchTerm}
                            onChange={handleFilterChange}
                            className="search-input"
                        />
                    </div>
                    
                    <div className="search-filter-item">
                        <label className="filter-label">Verification Status</label>
                        <select
                            name="verificationStatus"
                            value={filters.verificationStatus}
                            onChange={handleFilterChange}
                            className="search-select"
                        >
                            <option value="">All Freelancers</option>
                            <option value="true">Verified Only</option>
                            <option value="false">Unverified Only</option>
                        </select>
                    </div>
                </div>

                <div className="skills-filter-section">
                    <h4 className="skills-heading">Skills</h4>
                    <div className="skills-list">
                        {availableSkills.map(skill => (
                            <label 
                                key={skill} 
                                className={`skill-tag ${filters.skills.includes(skill) ? 'selected' : ''}`}
                            >
                                <input
                                    type="checkbox"
                                    className="skill-checkbox"
                                    checked={filters.skills.includes(skill)}
                                    onChange={() => handleSkillToggle(skill)}
                                />
                                <span>{skill}</span>
                                {filters.skills.includes(skill) && (
                                    <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="search-results-section">
                {loading ? (
                    <div className="loading-spinner-container">
                        <div className="loading-spinner"></div>
                    </div>
                ) : freelancers.length === 0 ? (
                    <div className="empty-results">
                        <svg className="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="empty-title">No freelancers found</p>
                        <p className="empty-message">Try adjusting your search filters</p>
                    </div>
                ) : (
                    <>
                        <div className="results-counter">
                            <p className="results-text">Showing {freelancers.length} of {pagination.total} freelancers</p>
                        </div>
                        
                        <div className="freelancers-grid">
                            {freelancers.map(freelancer => (
                                <FreelancerCard 
                                    key={freelancer._id} 
                                    freelancer={freelancer} 
                                />
                            ))}
                        </div>

                        {pagination.totalPages > 1 && (
                            <div className="pagination-controls">
                                <button
                                    className={`pagination-button ${pagination.currentPage === 1 ? 'disabled' : ''}`}
                                    disabled={pagination.currentPage === 1}
                                    onClick={() => handleSearch(pagination.currentPage - 1)}
                                >
                                    <svg className="pagination-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Previous
                                </button>
                                
                                <span className="pagination-info">
                                    Page {pagination.currentPage} of {pagination.totalPages}
                                </span>
                                
                                <button
                                    className={`pagination-button ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}
                                    disabled={pagination.currentPage === pagination.totalPages}
                                    onClick={() => handleSearch(pagination.currentPage + 1)}
                                >
                                    Next
                                    <svg className="pagination-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default FreelancerSearch;