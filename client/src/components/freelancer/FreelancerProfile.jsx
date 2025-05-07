import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { freelancerService } from '../../utils/freelancerService';
import FreelancerReviews from '../reviews/FreelancerReviews';

const FreelancerProfile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profile, setProfile] = useState({
        name: '',
        title: '',
        bio: '',
        hourlyRate: '',
        skills: [],
        education: [],
        experience: [],
        portfolio: []
    });
    const [newSkill, setNewSkill] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await freelancerService.getProfile();
            setProfile({
                name: response.data?.name || user?.name || '',
                title: response.data?.title || '',
                bio: response.data?.bio || '',
                hourlyRate: response.data?.hourlyRate || '',
                skills: response.data?.skills || [],
                education: response.data?.education || [],
                experience: response.data?.experience || [],
                portfolio: response.data?.portfolio || []
            });
        } catch (err) {
            console.error('Error fetching profile data:', err);
            setError('Failed to load profile. Please try again later.');
            
            // If API fails, use sample data for development
            if (process.env.NODE_ENV === 'development') {
                setProfile({
                    name: user?.name || 'Alex Johnson',
                    title: 'Full Stack Developer',
                    bio: 'Experienced developer with a focus on React and Node.js. I enjoy building responsive web applications with clean code and user-friendly interfaces.',
                    hourlyRate: '35',
                    skills: ['React', 'Node.js', 'JavaScript', 'MongoDB', 'Express', 'HTML/CSS'],
                    education: [
                        { school: 'University of Technology', degree: 'BS Computer Science', year: '2022' }
                    ],
                    experience: [
                        { 
                            company: 'Tech Solutions Inc.', 
                            position: 'Junior Developer', 
                            duration: '2022-2024',
                            description: 'Developed and maintained web applications using React and Node.js.'
                        }
                    ],
                    portfolio: [
                        {
                            title: 'E-commerce Website',
                            description: 'A full-featured online store with payment integration',
                            image: 'https://example.com/portfolio1.jpg',
                            link: 'https://example.com/project1'
                        },
                        {
                            title: 'Task Management App',
                            description: 'A responsive web app for task management with user authentication',
                            image: 'https://example.com/portfolio2.jpg',
                            link: 'https://example.com/project2'
                        }
                    ]
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddSkill = () => {
        if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
            setProfile(prev => ({
                ...prev,
                skills: [...prev.skills, newSkill.trim()]
            }));
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setProfile(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await freelancerService.updateProfile(profile);
            alert('Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            console.error('Error updating profile:', err);
            alert('Failed to update profile. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddPortfolioItem = () => {
        // This would typically open a modal for adding a new portfolio item
        // For now, we'll just add a placeholder item that can be edited
        setProfile(prev => ({
            ...prev,
            portfolio: [
                ...prev.portfolio,
                {
                    title: 'New Portfolio Item',
                    description: 'Add a description for your work',
                    image: '',
                    link: ''
                }
            ]
        }));
    };

    const handlePortfolioImageUpload = async (event, index) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('image', file);
            
            const response = await freelancerService.uploadPortfolioImage(formData);
            
            // Update the portfolio item with the new image URL
            const updatedPortfolio = [...profile.portfolio];
            updatedPortfolio[index].image = response.data.imageUrl;
            
            setProfile(prev => ({
                ...prev,
                portfolio: updatedPortfolio
            }));
        } catch (err) {
            console.error('Error uploading image:', err);
            alert('Failed to upload image. Please try again.');
        }
    };

    const styles = {
        container: {
            padding: '20px',
            maxWidth: '800px',
            margin: '0 auto'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
        },
        heading: {
            fontSize: '24px',
            fontWeight: 'bold'
        },
        button: {
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
        },
        buttonPrimary: {
            backgroundColor: '#1976d2',
            color: 'white'
        },
        buttonSecondary: {
            backgroundColor: '#f5f5f5',
            color: '#333',
            border: '1px solid #ddd'
        },
        section: {
            marginBottom: '30px',
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        },
        sectionTitle: {
            borderBottom: '1px solid #eee',
            paddingBottom: '10px',
            marginBottom: '15px',
            fontSize: '18px',
            fontWeight: 'bold'
        },
        formGroup: {
            marginBottom: '15px'
        },
        label: {
            display: 'block',
            marginBottom: '5px',
            fontWeight: '500'
        },
        input: {
            width: '100%',
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '14px'
        },
        textarea: {
            width: '100%',
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '14px',
            minHeight: '100px'
        },
        skillsContainer: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '15px'
        },
        skill: {
            backgroundColor: '#e3f2fd',
            color: '#1976d2',
            padding: '5px 10px',
            borderRadius: '20px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
        },
        removeSkill: {
            cursor: 'pointer',
            color: '#1976d2',
            fontWeight: 'bold'
        },
        addSkillContainer: {
            display: 'flex',
            gap: '10px',
            marginBottom: '20px'
        },
        portfolioGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '20px'
        },
        portfolioItem: {
            border: '1px solid #eee',
            borderRadius: '8px',
            overflow: 'hidden'
        },
        portfolioImage: {
            width: '100%',
            height: '150px',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        portfolioContent: {
            padding: '15px'
        },
        portfolioTitle: {
            fontWeight: 'bold',
            marginBottom: '5px'
        },
        portfolioDescription: {
            color: '#666',
            fontSize: '14px'
        },
        portfolioLink: {
            color: '#1976d2',
            textDecoration: 'none',
            fontSize: '14px',
            display: 'inline-block',
            marginTop: '10px'
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '40px' }}>Loading profile...</div>;
    }

    if (error && !profile.name) {
        return (
            <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
                {error}
                <p style={{ marginTop: '20px' }}>
                    <button 
                        onClick={fetchProfile}
                        style={{...styles.button, ...styles.buttonPrimary}}
                    >
                        Try Again
                    </button>
                </p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Profile Header */}
            <div style={styles.header}>
                <h2 style={styles.heading}>Profile & Portfolio</h2>
                {isEditing ? (
                    <button 
                        style={{...styles.button, ...styles.buttonSecondary}}
                        onClick={() => setIsEditing(false)}
                    >
                        Cancel Editing
                    </button>
                ) : (
                    <button 
                        style={{...styles.button, ...styles.buttonPrimary}}
                        onClick={() => setIsEditing(true)}
                    >
                        Edit Profile
                    </button>
                )}
            </div>
            
            {/* Basic Profile Information */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Basic Information</h3>
                
                {isEditing ? (
                    <form onSubmit={handleSubmit}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={profile.name}
                                onChange={handleInputChange}
                                style={styles.input}
                                required
                            />
                        </div>
                        
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Professional Title</label>
                            <input
                                type="text"
                                name="title"
                                value={profile.title}
                                onChange={handleInputChange}
                                style={styles.input}
                                placeholder="e.g. Full Stack Developer"
                                required
                            />
                        </div>
                        
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Hourly Rate (USD)</label>
                            <input
                                type="number"
                                name="hourlyRate"
                                value={profile.hourlyRate}
                                onChange={handleInputChange}
                                style={styles.input}
                                min="1"
                                required
                            />
                        </div>
                        
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Bio</label>
                            <textarea
                                name="bio"
                                value={profile.bio}
                                onChange={handleInputChange}
                                style={styles.textarea}
                                placeholder="Tell clients about your background and experience"
                                required
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            style={{...styles.button, ...styles.buttonPrimary}}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                ) : (
                    <div>
                        <p><strong>Name:</strong> {profile.name}</p>
                        <p><strong>Title:</strong> {profile.title || 'Not specified'}</p>
                        <p><strong>Hourly Rate:</strong> ${profile.hourlyRate}/hr</p>
                        <p><strong>Bio:</strong> {profile.bio || 'No bio provided'}</p>
                    </div>
                )}
            </div>
            
            {/* Skills Section */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Skills</h3>
                
                <div style={styles.skillsContainer}>
                    {profile.skills.length > 0 ? profile.skills.map((skill, index) => (
                        <div key={index} style={styles.skill}>
                            {skill}
                            {isEditing && (
                                <span 
                                    style={styles.removeSkill}
                                    onClick={() => handleRemoveSkill(skill)}
                                >
                                    ✕
                                </span>
                            )}
                        </div>
                    )) : (
                        <p style={{ color: '#666' }}>No skills added yet</p>
                    )}
                </div>
                
                {isEditing && (
                    <div style={styles.addSkillContainer}>
                        <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            placeholder="Add a skill"
                            style={styles.input}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                        />
                        <button 
                            onClick={handleAddSkill} 
                            style={{...styles.button, ...styles.buttonPrimary}}
                        >
                            Add
                        </button>
                    </div>
                )}
            </div>
            
            {/* Portfolio Section */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Portfolio</h3>
                
                <div style={styles.portfolioGrid}>
                    {profile.portfolio.length > 0 ? profile.portfolio.map((item, index) => (
                        <div key={index} style={styles.portfolioItem}>
                            <div style={styles.portfolioImage}>
                                {item.image ? (
                                    <img src={item.image} alt={item.title} style={{ maxWidth: '100%', maxHeight: '100%' }} />
                                ) : (
                                    <span>No image</span>
                                )}
                                {isEditing && (
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handlePortfolioImageUpload(e, index)}
                                        style={{ 
                                            position: 'absolute', 
                                            top: 0, 
                                            left: 0, 
                                            opacity: 0, 
                                            width: '100%', 
                                            height: '100%', 
                                            cursor: 'pointer' 
                                        }}
                                    />
                                )}
                            </div>
                            <div style={styles.portfolioContent}>
                                {isEditing ? (
                                    <>
                                        <input
                                            type="text"
                                            value={item.title}
                                            onChange={(e) => {
                                                const updated = [...profile.portfolio];
                                                updated[index].title = e.target.value;
                                                setProfile({...profile, portfolio: updated});
                                            }}
                                            style={{...styles.input, marginBottom: '10px'}}
                                            placeholder="Project Title"
                                        />
                                        <textarea
                                            value={item.description}
                                            onChange={(e) => {
                                                const updated = [...profile.portfolio];
                                                updated[index].description = e.target.value;
                                                setProfile({...profile, portfolio: updated});
                                            }}
                                            style={{...styles.input, marginBottom: '10px', height: '60px'}}
                                            placeholder="Project Description"
                                        />
                                        <input
                                            type="url"
                                            value={item.link}
                                            onChange={(e) => {
                                                const updated = [...profile.portfolio];
                                                updated[index].link = e.target.value;
                                                setProfile({...profile, portfolio: updated});
                                            }}
                                            style={styles.input}
                                            placeholder="Project URL"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <div style={styles.portfolioTitle}>{item.title}</div>
                                        <div style={styles.portfolioDescription}>{item.description}</div>
                                        {item.link && (
                                            <a href={item.link} target="_blank" rel="noopener noreferrer" style={styles.portfolioLink}>
                                                View Project
                                            </a>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )) : (
                        <p style={{ 
                            gridColumn: '1 / -1', 
                            textAlign: 'center', 
                            color: '#666', 
                            padding: '20px'
                        }}>
                            No portfolio items added yet
                        </p>
                    )}
                    
                    {isEditing && (
                        <div 
                            style={{
                                ...styles.portfolioItem, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                cursor: 'pointer',
                                backgroundColor: '#f5f5f5',
                                minHeight: '200px'
                            }}
                            onClick={handleAddPortfolioItem}
                        >
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '24px', marginBottom: '10px' }}>+</div>
                                <div>Add Portfolio Item</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Reviews Section */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Reviews & Ratings</h3>
                <FreelancerReviews freelancerId={user.id} />
            </div>
        </div>
    );
};

export default FreelancerProfile;