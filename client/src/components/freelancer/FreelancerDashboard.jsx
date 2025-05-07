import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProjectList from './ProjectList';
import ActiveProjects from './ActiveProjects';
import FreelancerProfile from './FreelancerProfile';
import EarningsTracker from './EarningsTracker';
import { FaProjectDiagram, FaUserCircle, FaChartLine, FaTasks, FaEnvelope } from 'react-icons/fa';

const FreelancerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('browse');

    const tabs = [
        { id: 'browse', label: 'Browse Projects', icon: <FaProjectDiagram /> },
        { id: 'active', label: 'Active Projects', icon: <FaTasks /> },
        { id: 'profile', label: 'Profile & Portfolio', icon: <FaUserCircle /> },
        { id: 'earnings', label: 'Earnings', icon: <FaChartLine /> },
        { id: 'messages', label: 'Messages', icon: <FaEnvelope /> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'browse':
                return <ProjectList />;
            case 'active':
                return <ActiveProjects />;
            case 'profile':
                return <FreelancerProfile />;
            case 'earnings':
                return <EarningsTracker />;
            case 'messages':
                // Navigate to messages page instead of rendering directly
                navigate('/messages');
                return null;
            default:
                return <ProjectList />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Dashboard Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
                            <p className="text-gray-600">Freelancer Dashboard</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                Available for Work
                            </span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                Rating: {user?.rating || '0.0'} ⭐
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center px-3 py-2 text-sm font-medium border-b-2 
                                    ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                                `}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {renderContent()}
            </div>
        </div>
    );
};

export default FreelancerDashboard;