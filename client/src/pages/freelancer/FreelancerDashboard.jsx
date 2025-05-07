import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProjectList from '../../components/freelancer/ProjectList';
import ProjectDetails from '../../components/freelancer/ProjectDetails';
import FreelancerProfile from '../../components/freelancer/FreelancerProfile';
import ActiveProjects from '../../components/freelancer/ActiveProjects';
import EarningsTracker from '../../components/freelancer/EarningsTracker';
import ConversationList from '../../components/common/ConversationList';

const FreelancerDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Basic CSS styles
    const styles = {
        dashboard: {
            padding: '20px',
            maxWidth: '1200px',
            margin: '0 auto',
            fontFamily: 'Arial, sans-serif'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            padding: '10px',
            backgroundColor: '#f5f5f5',
            borderRadius: '5px'
        },
        nav: {
            display: 'flex',
            gap: '20px',
            marginBottom: '20px',
            padding: '10px 0',
            borderBottom: '1px solid #e0e0e0'
        },
        link: {
            textDecoration: 'none',
            color: '#333',
            padding: '5px 10px',
            borderRadius: '3px'
        },
        activeLink: {
            backgroundColor: '#007bff',
            color: 'white'
        },
        button: {
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
        },
        badge: {
            backgroundColor: '#28a745',
            color: 'white',
            padding: '3px 8px',
            borderRadius: '10px',
            fontSize: '12px',
            marginRight: '10px'
        },
        content: {
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '5px',
            minHeight: '300px'
        }
    };

    // Get current path for active link styling
    const currentPath = window.location.pathname;

    return (
        <div style={styles.dashboard}>
            {/* Dashboard Header */}
            <div style={styles.header}>
                <div>
                    <h1>Welcome, {user?.name || 'Freelancer'}!</h1>
                    <p>Freelancer Dashboard</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={styles.badge}>Available for Work</span>
                    <button style={styles.button} onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav style={styles.nav}>
                <Link to="/freelancer" style={{...styles.link, ...(currentPath === '/freelancer' ? styles.activeLink : {})}}>Browse Projects</Link>
                <Link to="/freelancer/active-projects" style={{...styles.link, ...(currentPath === '/freelancer/active-projects' ? styles.activeLink : {})}}>Active Projects</Link>
                <Link to="/freelancer/profile" style={{...styles.link, ...(currentPath === '/freelancer/profile' ? styles.activeLink : {})}}>Profile & Portfolio</Link>
                <Link to="/freelancer/earnings" style={{...styles.link, ...(currentPath === '/freelancer/earnings' ? styles.activeLink : {})}}>Earnings</Link>
                <Link to="/freelancer/verification" style={{...styles.link, ...(currentPath === '/freelancer/verification' ? styles.activeLink : {})}}>Verification</Link>
                <Link to="/freelancer/messages" style={{...styles.link, ...(currentPath === '/freelancer/messages' ? styles.activeLink : {})}}>Messages</Link>
            </nav>

            {/* Main Content */}
            <div style={styles.content}>
                <Routes>
                    <Route index element={<ProjectList />} />
                    <Route path="projects/:id" element={<ProjectDetails />} />
                    <Route path="active-projects" element={<ActiveProjects />} />
                    <Route path="profile" element={<FreelancerProfile />} />
                    <Route path="earnings" element={<EarningsTracker />} />
                    <Route path="messages" element={<ConversationList />} />
                </Routes>
            </div>
        </div>
    );
};

export default FreelancerDashboard;