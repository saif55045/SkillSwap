import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { analyticsService } from '../../utils/analyticsService';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import './AnalyticsDashboard.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
);

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [tempDateRange, setTempDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user || user.role !== 'client') return;

      try {
        setLoading(true);
        setError('');
        const data = await analyticsService.getClientAnalytics(user.id, dateRange);
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, dateRange]);

  // Handle date filter changes
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setTempDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply date filters
  const applyDateFilter = () => {
    setDateRange({
      startDate: tempDateRange.startDate,
      endDate: tempDateRange.endDate
    });
  };

  // Reset date filters
  const resetDateFilter = () => {
    setTempDateRange({
      startDate: '',
      endDate: ''
    });
    setDateRange({
      startDate: '',
      endDate: ''
    });
  };

  // Handle export
  const handleExport = async (type) => {
    if (!user) return;

    try {
      await analyticsService.exportAnalyticsCSV(user.id, type, dateRange);
    } catch (err) {
      console.error(`Failed to export ${type} data:`, err);
      setError(`Failed to export ${type} data. Please try again later.`);
    }
  };

  // Prepare chart data for project status counts
  const getProjectStatusData = () => {
    if (!analytics || !analytics.projectStatusCounts) {
      return {
        labels: [],
        datasets: []
      };
    }

    const statusLabels = analytics.projectStatusCounts.map(item => item._id);
    const statusCounts = analytics.projectStatusCounts.map(item => item.count);

    return {
      labels: statusLabels,
      datasets: [
        {
          label: 'Projects by Status',
          data: statusCounts,
          backgroundColor: [
            '#4caf50',  // open (green)
            '#2196f3',  // in-progress (blue)
            '#673ab7',  // completed (purple)
            '#f44336',  // cancelled (red)
          ],
          borderWidth: 0,
        },
      ],
    };
  };

  // Prepare chart data for project timeline
  const getProjectTimelineData = () => {
    if (!analytics || !analytics.projectTimeline) {
      return {
        labels: [],
        datasets: []
      };
    }

    const dates = analytics.projectTimeline.map(item => item._id);
    const counts = analytics.projectTimeline.map(item => item.count);

    return {
      labels: dates,
      datasets: [
        {
          label: 'Project Activity',
          data: counts,
          fill: true,
          borderColor: '#4a6bf5',
          backgroundColor: 'rgba(74, 107, 245, 0.1)',
          tension: 0.4,
        },
      ],
    };
  };

  // Prepare budget comparison chart
  const getBudgetComparisonData = () => {
    if (!analytics || !analytics.budgetAnalytics || analytics.budgetAnalytics.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Take the latest 5 projects for clarity
    const visibleProjects = analytics.budgetAnalytics.slice(0, 5);
    
    return {
      labels: visibleProjects.map(project => project.title),
      datasets: [
        {
          label: 'Expected Budget',
          data: visibleProjects.map(project => project.avgBudget),
          backgroundColor: 'rgba(33, 150, 243, 0.6)',
        },
        {
          label: 'Actual Amount',
          data: visibleProjects.map(project => project.actualAmount),
          backgroundColor: 'rgba(76, 175, 80, 0.6)',
        },
      ],
    };
  };

  // Format numbers with commas for thousands
  const formatNumber = (number) => {
    return number.toLocaleString();
  };
  
  // Generate star rating display
  const renderStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round(rating);
    
    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        stars.push('★');
      } else {
        stars.push('☆');
      }
    }
    
    return <span className="rating-stars">{stars.join('')}</span>;
  };

  // Get total projects count
  const getTotalProjects = () => {
    if (!analytics || !analytics.projectStatusCounts) return 0;
    return analytics.projectStatusCounts.reduce((total, status) => total + status.count, 0);
  };

  if (loading) {
    return (
      <div className="analytics-dashboard">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Analytics Dashboard</h2>
        <div className="date-filter">
          <input 
            type="date" 
            name="startDate"
            value={tempDateRange.startDate}
            onChange={handleDateRangeChange}
            placeholder="Start Date"
          />
          <input 
            type="date" 
            name="endDate"
            value={tempDateRange.endDate}
            onChange={handleDateRangeChange}
            placeholder="End Date"
          />
          <button onClick={applyDateFilter}>Apply Filter</button>
          <button onClick={resetDateFilter}>Reset</button>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="dashboard-grid">
        {/* Project Status Summary */}
        <div className="analytics-card">
          <h3>Project Status Summary</h3>
          <div className="chart-container">
            <Doughnut 
              data={getProjectStatusData()} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      boxWidth: 12,
                      font: {
                        size: 12
                      }
                    }
                  },
                  title: {
                    display: true,
                    text: `Total Projects: ${getTotalProjects()}`,
                    font: {
                      size: 14
                    }
                  }
                }
              }}
            />
          </div>
        </div>
        
        {/* Project Timeline */}
        <div className="analytics-card">
          <h3>Project Timeline</h3>
          <div className="chart-container">
            <Line 
              data={getProjectTimelineData()} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y;
                        return `${label}: ${value} projects`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0 // Only show integers
                    }
                  }
                }
              }}
            />
          </div>
        </div>
        
        {/* Project Status Cards */}
        <div className="analytics-card">
          <h3>Project Status</h3>
          <div className="status-grid">
            {analytics && analytics.projectStatusCounts && analytics.projectStatusCounts.map(status => (
              <div 
                key={status._id} 
                className={`status-item ${status._id}`}
              >
                <div className="status-number">{status.count}</div>
                <div className="status-label">{status._id}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Budget Comparison */}
        <div className="analytics-card">
          <h3>Budget vs. Actual Cost</h3>
          <div className="chart-container">
            <Bar 
              data={getBudgetComparisonData()} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        </div>
        
        {/* Freelancer Performance Table */}
        <div className="analytics-card">
          <h3>Freelancer Performance</h3>
          {analytics && analytics.freelancerPerformance && analytics.freelancerPerformance.length > 0 ? (
            <table className="freelancer-table">
              <thead>
                <tr>
                  <th>Freelancer</th>
                  <th>Projects</th>
                  <th>Rating</th>
                  <th>On Time %</th>
                </tr>
              </thead>
              <tbody>
                {analytics.freelancerPerformance.map(freelancer => (
                  <tr key={freelancer._id}>
                    <td>{freelancer.name}</td>
                    <td>{freelancer.completedProjects}</td>
                    <td>
                      {renderStars(freelancer.avgRating)} 
                      <span style={{ marginLeft: '5px' }}>
                        ({freelancer.avgRating.toFixed(1)})
                      </span>
                    </td>
                    <td>{freelancer.onTimePercentage.toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No freelancer performance data available.</p>
          )}
        </div>
        
        {/* Bid Analytics */}
        <div className="analytics-card">
          <h3>Bid Analytics</h3>
          {analytics && analytics.bidAnalytics && analytics.bidAnalytics.length > 0 ? (
            <table className="freelancer-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Bids</th>
                  <th>Avg Amount</th>
                  <th>Min/Max</th>
                </tr>
              </thead>
              <tbody>
                {analytics.bidAnalytics.map(bid => {
                  // Find the project title
                  const project = analytics.budgetAnalytics?.find(p => 
                    p._id.toString() === bid._id.toString()
                  );
                  const projectTitle = project?.title || 'Unknown Project';
                  
                  return (
                    <tr key={bid._id}>
                      <td>{projectTitle}</td>
                      <td>{bid.bidCount}</td>
                      <td>${bid.avgBidAmount.toFixed(2)}</td>
                      <td>${bid.minBid} - ${bid.maxBid}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p>No bid analytics data available.</p>
          )}
        </div>
      </div>
      
      {/* Export Section */}
      <div className="export-section">
        <h3 className="export-title">Export Reports</h3>
        <div className="export-buttons">
          <button 
            className="export-button" 
            onClick={() => handleExport('projects')}
          >
            <svg className="export-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export Projects
          </button>
          <button 
            className="export-button"
            onClick={() => handleExport('bids')}
          >
            <svg className="export-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export Bids
          </button>
          <button 
            className="export-button"
            onClick={() => handleExport('freelancers')}
          >
            <svg className="export-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export Freelancer Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;