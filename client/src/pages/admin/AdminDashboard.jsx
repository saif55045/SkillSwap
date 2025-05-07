import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PlatformAnalytics from '../../components/admin/PlatformAnalytics';
import NotificationSystem from '../../components/admin/NotificationSystem';
import UserManagement from '../../components/admin/UserManagement';
import ProjectManagement from '../../components/admin/ProjectManagement';
import { adminDashboardService } from '../../utils/adminDashboardService';

const FreelancerVerification = () => (
    <div>
        <h2>Freelancer Verification</h2>
        <p>Process verification requests from freelancers</p>
        <div style={{ marginTop: "20px" }}>
            <p>This feature is coming soon. You'll be able to approve or reject verification requests here.</p>
        </div>
    </div>
);

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    
    // Basic CSS styles for admin dashboard
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
            padding: '15px',
            backgroundColor: '#212529',
            color: 'white',
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
            padding: '8px 16px',
            borderRadius: '3px',
            fontWeight: '500'
        },
        activeLink: {
            backgroundColor: '#0d6efd',
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
        content: {
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '5px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            minHeight: '500px'
        }
    };
    
    // Get current path for active link styling
    const currentPath = window.location.pathname;
    
    return (
        <div style={styles.dashboard}>
            {/* Dashboard Header */}
            <div style={styles.header}>
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>Manage your platform</p>
                </div>
                <button style={styles.button} onClick={handleLogout}>
                    Logout
                </button>
            </div>
            
            {/* Navigation */}
            <nav style={styles.nav}>
                <Link to="/admin" style={{...styles.link, ...(currentPath === '/admin' ? styles.activeLink : {})}}>
                    Dashboard
                </Link>
                <Link to="/admin/verification" style={{...styles.link, ...(currentPath.includes('/admin/verification') ? styles.activeLink : {})}}>
                    Freelancer Verification
                </Link>
                <Link to="/admin/users" style={{...styles.link, ...(currentPath === '/admin/users' ? styles.activeLink : {})}}>
                    User Management
                </Link>
                <Link to="/admin/projects" style={{...styles.link, ...(currentPath === '/admin/projects' ? styles.activeLink : {})}}>
                    Projects
                </Link>
                <Link to="/admin/analytics" style={{...styles.link, ...(currentPath === '/admin/analytics' ? styles.activeLink : {})}}>
                    Analytics
                </Link>
                <Link to="/admin/notifications" style={{...styles.link, ...(currentPath === '/admin/notifications' ? styles.activeLink : {})}}>
                    Notifications
                </Link>
            </nav>
            
            {/* Main Content */}
            <div style={styles.content}>
                <Routes>
                    <Route index element={<AdminHome />} />
                    <Route path="verification" element={<FreelancerVerification />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="projects" element={<ProjectManagement />} />
                    <Route path="analytics" element={<PlatformAnalyticsPage />} />
                    <Route path="notifications" element={<NotificationSystemPage />} />
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
            </div>
        </div>
    );
};

// Admin home component with real data from API
const AdminHome = () => {
    const [stats, setStats] = useState({
        pendingVerifications: 0,
        newUsers: 0,
        activeProjects: 0,
        platformHealth: 'Loading...',
        notificationsCount: 'Loading...'
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                setLoading(true);
                const response = await adminDashboardService.getDashboardStats();
                setStats(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
                setError('Failed to load dashboard statistics. Please try again later.');
                setLoading(false);
            }
        };
        
        fetchDashboardStats();
    }, []);

    // Display loading state
    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <p>Loading dashboard data...</p>
            </div>
        );
    }

    // Display error state
    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#dc3545' }}>
                <h3>Error</h3>
                <p>{error}</p>
            </div>
        );
    }
    
    return (
        <div>
            <h2>Admin Dashboard Overview</h2>
            <p>Welcome to the SkillSwap Admin Dashboard. Navigate using the links above to manage different aspects of the platform.</p>
            
            <div style={{ marginTop: '20px' }}>
                <h3>Quick Links</h3>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                    gap: '20px',
                    marginTop: '15px' 
                }}>
                    <QuickLinkCard 
                        title="Verification Requests" 
                        count={stats.pendingVerifications} 
                        link="/admin/verification" 
                        backgroundColor="#0d6efd"
                    />
                    <QuickLinkCard 
                        title="New Users" 
                        count={stats.newUsers} 
                        link="/admin/users" 
                        backgroundColor="#198754"
                    />
                    <QuickLinkCard 
                        title="Active Projects" 
                        count={stats.activeProjects} 
                        link="/admin/projects" 
                        backgroundColor="#fd7e14"
                    />
                    <QuickLinkCard 
                        title="Platform Health" 
                        count={stats.platformHealth} 
                        link="/admin/analytics" 
                        backgroundColor="#6f42c1"
                    />
                    <QuickLinkCard 
                        title="Notification Center" 
                        count={stats.notificationsCount} 
                        link="/admin/notifications" 
                        backgroundColor="#20c997"
                    />
                </div>
            </div>
        </div>
    );
};

// Platform Analytics page wrapper
const PlatformAnalyticsPage = () => {
    return (
        <div>
            <h2>Platform Analytics</h2>
            <p>View comprehensive data about platform performance, user growth, and revenue.</p>
            <div style={{ marginTop: '20px' }}>
                <PlatformAnalytics />
            </div>
        </div>
    );
};

// Notification System page wrapper
const NotificationSystemPage = () => {
    return (
        <div>
            <h2>Notification Management</h2>
            <p>Manage notification templates and send notifications to users.</p>
            <div style={{ marginTop: '20px' }}>
                <NotificationSystem />
            </div>
        </div>
    );
};

// Quick link card component for dashboard
const QuickLinkCard = ({ title, count, link, backgroundColor }) => {
    const navigate = useNavigate();
    
    return (
        <div 
            style={{
                padding: '20px',
                backgroundColor: backgroundColor,
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onClick={() => navigate(link)}
        >
            <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>{title}</h3>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{count}</div>
        </div>
    );
};

export default AdminDashboard;