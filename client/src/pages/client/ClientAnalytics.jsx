import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AnalyticsDashboard from '../../components/client/AnalyticsDashboard';

const ClientAnalytics = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleNavigateToProjects = () => {
    navigate('/client/dashboard');
  };

  const handleNavigateToSearch = () => {
    navigate('/client/search');
  };

  const handleNavigateToMessages = () => {
    navigate('/messages');
  };

  return (
    <div>
      <header className="nav-header">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>SkillSwap</h1>
          <div>
            <span style={{ marginRight: '1rem' }}>Welcome, {user?.name}</span>
            <button onClick={logout} className="btn btn-danger">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        <div style={{ marginTop: '1rem', marginBottom: '2rem' }}>
          <button
            onClick={handleNavigateToProjects}
            style={{ marginRight: '1rem' }}
            className="btn"
          >
            My Projects
          </button>
          <button
            onClick={handleNavigateToSearch}
            style={{ marginRight: '1rem' }}
            className="btn"
          >
            Find Freelancers
          </button>
          <button
            className="btn"
            onClick={handleNavigateToMessages}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Messages
            </span>
          </button>
          <button
            className="btn btn-primary"
            style={{ marginLeft: '1rem' }}
            disabled
          >
            Analytics
          </button>
        </div>

        <AnalyticsDashboard />
      </div>
    </div>
  );
};

export default ClientAnalytics;