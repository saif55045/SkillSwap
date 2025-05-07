import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { projectService } from '../../utils/projectService';
import BidForm from '../../components/freelancer/BidForm';
import BidList from '../../components/freelancer/BidList';
import ProjectReview from '../../components/reviews/ProjectReview';
import toast from 'react-hot-toast';

const ProjectDetails = () => {
    const { projectId } = useParams();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProject();
    }, [projectId]);

    const loadProject = async () => {
        try {
            const data = await projectService.getProjectById(projectId);
            setProject(data);
        } catch (error) {
            toast.error('Error loading project details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading project details...</div>;
    if (!project) return <div>Project not found</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Project Details</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-gray-600">Budget Range</p>
                                <p className="font-medium">${project.minBudget} - ${project.maxBudget}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Duration</p>
                                <p className="font-medium">{project.duration} days</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Skills Required</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {project.skills.map(skill => (
                                        <span 
                                            key={skill}
                                            className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-gray-600">Status</p>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                    ${project.status === 'open' ? 'bg-green-100 text-green-800' : 
                                      project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                                      'bg-gray-100 text-gray-800'}`}
                                >
                                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                </span>
                            </div>
                        </div>
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-2">Description</h3>
                            <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
                        </div>
                    </div>

                    <div>
                        {user.role === 'freelancer' && project.status === 'open' && (
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold mb-4">Submit Your Bid</h2>
                                <BidForm 
                                    projectId={projectId} 
                                    onBidSubmit={() => loadProject()}
                                />
                            </div>
                        )}

                        <div>
                            <h2 className="text-xl font-semibold mb-4">Project Bids</h2>
                            <BidList 
                                projectId={projectId}
                                projectStatus={project.status}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {project.status === 'completed' && project.selectedFreelancer && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <ProjectReview 
                        projectId={projectId}
                        freelancerId={project.selectedFreelancer._id || project.selectedFreelancer}
                        projectTitle={project.title}
                    />
                </div>
            )}
        </div>
    );
};

export default ProjectDetails;