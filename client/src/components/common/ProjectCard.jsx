import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaClock, FaMoneyBillWave, FaCode } from 'react-icons/fa';

const ProjectCard = ({ project, onSubmitProposal }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);

    const handleViewDetails = () => {
        navigate(`/projects/${project._id}`);
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'open':
                return 'bg-green-100 text-green-800';
            case 'in-progress':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-purple-100 text-purple-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {/* Project Header */}
            <div className="p-5">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(project.status)}`}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                </div>
                <p className="text-gray-500 text-sm mb-3">Posted by {project.clientId?.name || 'Client'}</p>

                {/* Project Brief Description */}
                <p className="text-gray-700 mb-4">
                    {isExpanded 
                        ? project.description 
                        : `${project.description.substring(0, 150)}${project.description.length > 150 ? '...' : ''}`
                    }
                </p>
                {project.description.length > 150 && (
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)} 
                        className="text-blue-600 text-sm hover:text-blue-800"
                    >
                        {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                )}

                {/* Project Details */}
                <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex items-center text-gray-600">
                        <FaMoneyBillWave className="mr-2 text-green-500" />
                        <span>${project.minBudget} - ${project.maxBudget}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                        <FaClock className="mr-2 text-blue-500" />
                        <span>{project.duration} days</span>
                    </div>
                </div>

                {/* Skills Required */}
                <div className="mt-4">
                    <div className="flex items-center text-gray-600 mb-2">
                        <FaCode className="mr-2 text-purple-500" />
                        <span>Required Skills:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {project.skills.map((skill, index) => (
                            <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 flex gap-2">
                    <button
                        onClick={handleViewDetails}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                        View Details
                    </button>
                    {user?.role === 'freelancer' && project.status === 'open' && onSubmitProposal && (
                        <button
                            onClick={onSubmitProposal}
                            className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                        >
                            Submit Proposal
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;