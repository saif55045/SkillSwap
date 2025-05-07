import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { freelancerService } from '../../utils/freelancerService';
import FreelancerReviews from '../reviews/FreelancerReviews';

const PublicFreelancerProfile = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const data = await freelancerService.getPublicFreelancerProfile(id);
                setProfile(data);
                setError(null);
            } catch (err) {
                setError('Freelancer not found');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    if (loading) return <div style={{ padding: 32, textAlign: 'center' }}>Loading profile...</div>;
    if (error) return <div style={{ padding: 32, textAlign: 'center', color: 'red' }}>{error}</div>;
    if (!profile) return null;

    return (
        <div>
            <div style={{ maxWidth: 600, margin: '32px auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24 }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>{profile.name}</h2>
                <div style={{ marginBottom: 16 }}>
                    <strong>Skills:</strong>
                    <ul style={{ margin: '8px 0', padding: 0, listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {profile.skills && profile.skills.length > 0 ? (
                            profile.skills.map((skill, idx) => (
                                <li key={idx} style={{ background: '#e3f2fd', color: '#1976d2', padding: '4px 12px', borderRadius: 12, fontSize: 14 }}>{skill}</li>
                            ))
                        ) : (
                            <li>No skills listed</li>
                        )}
                    </ul>
                </div>
                <div style={{ marginBottom: 16 }}>
                    <strong>Portfolio:</strong>
                    <ul style={{ margin: '8px 0', padding: 0, listStyle: 'none' }}>
                        {profile.portfolio && profile.portfolio.length > 0 ? (
                            profile.portfolio.map((item, idx) => (
                                <li key={idx} style={{ marginBottom: 8 }}>
                                    <div style={{ fontWeight: 600 }}>{item.title}</div>
                                    <div style={{ color: '#555' }}>{item.description}</div>
                                    {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2' }}>View Project</a>}
                                </li>
                            ))
                        ) : (
                            <li>No portfolio items</li>
                        )}
                    </ul>
                </div>
                <div style={{ marginBottom: 16 }}>
                    <strong>Verified:</strong> {profile.verified ? 'Yes' : 'No'}
                </div>
                {/* Add more fields as needed */}
            </div>
            
            {/* Reviews section */}
            <div style={{ marginTop: 40 }}>
                <FreelancerReviews freelancerId={id} />
            </div>
        </div>
    );
};

export default PublicFreelancerProfile;