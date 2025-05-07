import { useState } from 'react';
import { projectService } from '../../utils/projectService';
import toast from 'react-hot-toast';

const ProjectForm = ({ project = null, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        title: project?.title || '',
        description: project?.description || '',
        requirements: project?.requirements || [''],
        deadline: project?.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '',
        minBudget: project?.minBudget || '',
        maxBudget: project?.maxBudget || '',
        duration: project?.duration || '',
        category: project?.category || '',
        skills: project?.skills || []
    });
    const [loading, setLoading] = useState(false);

    const categories = [
        'Web Development',
        'Mobile Development',
        'UI/UX Design',
        'Content Writing',
        'Digital Marketing',
        'Data Analysis',
        'Other'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRequirementChange = (index, value) => {
        const newRequirements = [...formData.requirements];
        newRequirements[index] = value;
        setFormData(prev => ({
            ...prev,
            requirements: newRequirements
        }));
    };

    const addRequirement = () => {
        setFormData(prev => ({
            ...prev,
            requirements: [...prev.requirements, '']
        }));
    };

    const removeRequirement = (index) => {
        if (formData.requirements.length > 1) {
            const newRequirements = formData.requirements.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                requirements: newRequirements
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate budget range
            const minBudget = Number(formData.minBudget);
            const maxBudget = Number(formData.maxBudget);
            if (maxBudget < minBudget) {
                throw new Error('Maximum budget cannot be less than minimum budget');
            }

            // Clean and format data
            const cleanedData = {
                ...formData,
                requirements: formData.requirements.filter(req => req.trim() !== ''),
                duration: Number(formData.duration),
                minBudget,
                maxBudget,
                // Ensure skills is an array of strings
                skills: formData.skills.map(skill => skill.trim()).filter(Boolean)
            };

            if (cleanedData.skills.length === 0) {
                throw new Error('At least one skill is required');
            }

            if (project) {
                await projectService.updateProject(project._id, cleanedData);
                toast.success('Project updated successfully');
            } else {
                await projectService.createProject(cleanedData);
                toast.success('Project created successfully');
            }
            onSubmit();
        } catch (error) {
            toast.error(error.message || 'Failed to save project');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h2>{project ? 'Edit Project' : 'Create New Project'}</h2>
            
            <div className="form-group">
                <label>Project Title</label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter project title"
                    required
                    minLength={5}
                    maxLength={100}
                />
            </div>

            <div className="form-group">
                <label>Category</label>
                <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="form-input"
                    required
                >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter project description"
                    required
                    minLength={20}
                    maxLength={1000}
                    rows={4}
                />
            </div>

            <div className="form-group">
                <label>Requirements</label>
                {formData.requirements.map((req, index) => (
                    <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input
                            type="text"
                            value={req}
                            onChange={(e) => handleRequirementChange(index, e.target.value)}
                            className="form-input"
                            placeholder="Enter requirement"
                            style={{ flex: 1 }}
                        />
                        <button
                            type="button"
                            onClick={() => removeRequirement(index)}
                            className="btn btn-danger"
                            disabled={formData.requirements.length === 1}
                        >
                            Remove
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addRequirement}
                    className="btn"
                    style={{ marginTop: '8px' }}
                >
                    Add Requirement
                </button>
            </div>

            <div className="form-group">
                <label>Budget Range (USD)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="number"
                        name="minBudget"
                        value={formData.minBudget}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Minimum budget"
                        required
                        min="1"
                    />
                    <input
                        type="number"
                        name="maxBudget"
                        value={formData.maxBudget}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Maximum budget"
                        required
                        min="1"
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Project Duration (days)</label>
                <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter project duration in days"
                    required
                    min="1"
                    max="365"
                />
            </div>

            <div className="form-group">
                <label>Deadline</label>
                <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="form-input"
                    required
                    min={new Date().toISOString().split('T')[0]}
                />
            </div>

            <div className="form-group">
                <label>Required Skills</label>
                <input
                    type="text"
                    value={formData.skills.join(', ')}
                    onChange={(e) => setFormData(prev => ({
                        ...prev,
                        skills: e.target.value.split(',').map(skill => skill.trim()).filter(Boolean)
                    }))}
                    className="form-input"
                    placeholder="Enter required skills (comma-separated)"
                    required
                />
                <small className="text-gray-600">Example: React, Node.js, MongoDB</small>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    style={{ flex: 1 }}
                >
                    {loading ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="btn"
                    disabled={loading}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default ProjectForm;