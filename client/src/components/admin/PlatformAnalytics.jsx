import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import './PlatformAnalytics.css';
import Chart from 'chart.js/auto';

const PlatformAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    userGrowth: [],
    projectGrowth: [],
    revenue: [],
    popularSkills: [],
    verificationStats: {},
    transactionStats: {}
  });
  const [timeFilter, setTimeFilter] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('growth');
  
  const [growthChart, setGrowthChart] = useState(null);
  const [revenueChart, setRevenueChart] = useState(null);
  const [skillsChart, setSkillsChart] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeFilter]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch platform growth data
      const growthResponse = await axios.get(`${API_URL}/admin/analytics/platform-growth?period=${timeFilter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch revenue data
      const revenueResponse = await axios.get(`${API_URL}/admin/analytics/revenue`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch popular skills
      const skillsResponse = await axios.get(`${API_URL}/admin/analytics/popular-skills`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch verification stats
      const verificationResponse = await axios.get(`${API_URL}/admin/analytics/verification-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch transaction stats
      const transactionResponse = await axios.get(`${API_URL}/admin/analytics/transactions?period=month`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAnalyticsData({
        userGrowth: growthResponse.data.data.userGrowth,
        projectGrowth: growthResponse.data.data.projectGrowth,
        revenue: revenueResponse.data.data.revenueData,
        projections: revenueResponse.data.data.projections,
        popularSkills: skillsResponse.data.data.popularSkills,
        demandedSkills: skillsResponse.data.data.demandedSkills,
        verificationStats: verificationResponse.data.data,
        transactionStats: transactionResponse.data.data
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to fetch analytics data. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && activeTab === 'growth') {
      renderGrowthChart();
    } else if (!loading && activeTab === 'revenue') {
      renderRevenueChart();
    } else if (!loading && activeTab === 'skills') {
      renderSkillsChart();
    }
  }, [loading, activeTab, analyticsData]);

  const renderGrowthChart = () => {
    const ctx = document.getElementById('growthChart');
    
    if (!ctx) return;
    
    // Destroy previous chart instance
    if (growthChart) {
      growthChart.destroy();
    }
    
    if (analyticsData.userGrowth && analyticsData.userGrowth.length > 0) {
      const labels = analyticsData.userGrowth.map(item => {
        if (timeFilter === 'monthly') {
          return `${item._id.month}/${item._id.year}`;
        } else if (timeFilter === 'weekly') {
          return `Week ${item._id.week}, ${item._id.year}`;
        } else {
          return `${item._id.day}/${item._id.month}/${item._id.year}`;
        }
      });
      
      const newUsersData = analyticsData.userGrowth.map(item => item.newUsers);
      const freelancersData = analyticsData.userGrowth.map(item => item.freelancers);
      const clientsData = analyticsData.userGrowth.map(item => item.clients);
      
      const projectData = analyticsData.projectGrowth.map(item => item.newProjects);
      
      const newChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'New Users',
              data: newUsersData,
              borderColor: '#4CAF50',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              tension: 0.3,
              fill: true
            },
            {
              label: 'Freelancers',
              data: freelancersData,
              borderColor: '#2196F3',
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              tension: 0.3,
              fill: true
            },
            {
              label: 'Clients',
              data: clientsData,
              borderColor: '#FF9800',
              backgroundColor: 'rgba(255, 152, 0, 0.1)',
              tension: 0.3,
              fill: true
            },
            {
              label: 'New Projects',
              data: projectData,
              borderColor: '#9C27B0',
              backgroundColor: 'rgba(156, 39, 176, 0.1)',
              tension: 0.3,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Platform Growth Over Time'
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
      
      setGrowthChart(newChart);
    }
  };

  const renderRevenueChart = () => {
    const ctx = document.getElementById('revenueChart');
    
    if (!ctx) return;
    
    // Destroy previous chart instance
    if (revenueChart) {
      revenueChart.destroy();
    }
    
    if (analyticsData.revenue && analyticsData.revenue.length > 0) {
      const labels = analyticsData.revenue.map(item => `${item._id.month}/${item._id.year}`);
      
      // Historical revenue data
      const revenueData = analyticsData.revenue.map(item => item.totalRevenue);
      const transactionData = analyticsData.revenue.map(item => item.transactionCount);
      
      // Projected revenue data
      let projectionLabels = [];
      let projectionData = [];
      
      if (analyticsData.projections && analyticsData.projections.length > 0) {
        const lastDataPoint = analyticsData.revenue[analyticsData.revenue.length - 1];
        const lastMonth = lastDataPoint._id.month;
        const lastYear = lastDataPoint._id.year;
        
        analyticsData.projections.forEach((projection, index) => {
          let nextMonth = lastMonth + index + 1;
          let nextYear = lastYear;
          
          // Handle year change
          if (nextMonth > 12) {
            nextMonth = nextMonth - 12;
            nextYear += 1;
          }
          
          projectionLabels.push(`${nextMonth}/${nextYear}`);
          projectionData.push(projection.projectedRevenue);
        });
      }
      
      // Combine historical and projected data
      const combinedLabels = [...labels, ...projectionLabels];
      const combinedRevenueData = [...revenueData, ...projectionData];
      
      // Fill transaction data with nulls for projections to maintain correct length
      const combinedTransactionData = [...transactionData, ...new Array(projectionLabels.length).fill(null)];
      
      const newChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: combinedLabels,
          datasets: [
            {
              label: 'Revenue ($)',
              data: combinedRevenueData,
              borderColor: '#4CAF50',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              tension: 0.3,
              fill: true
            },
            {
              label: 'Transaction Count',
              data: combinedTransactionData,
              borderColor: '#2196F3',
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              tension: 0.3,
              fill: true,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Revenue Analytics with Projections'
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                title: function(tooltipItems) {
                  const index = tooltipItems[0].dataIndex;
                  if (index >= labels.length) {
                    return combinedLabels[index] + ' (Projected)';
                  }
                  return combinedLabels[index];
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Revenue ($)'
              }
            },
            y1: {
              beginAtZero: true,
              position: 'right',
              grid: {
                drawOnChartArea: false
              },
              title: {
                display: true,
                text: 'Transaction Count'
              }
            }
          }
        }
      });
      
      setRevenueChart(newChart);
    }
  };

  const renderSkillsChart = () => {
    const popularCtx = document.getElementById('popularSkillsChart');
    const demandedCtx = document.getElementById('demandedSkillsChart');
    
    if (!popularCtx || !demandedCtx) return;
    
    // Destroy previous chart instance
    if (skillsChart) {
      skillsChart.destroy();
    }
    
    if (analyticsData.popularSkills && analyticsData.popularSkills.length > 0) {
      // Popular skills chart
      const popularSkills = analyticsData.popularSkills.map(skill => skill._id);
      const popularCounts = analyticsData.popularSkills.map(skill => skill.count);
      
      new Chart(popularCtx, {
        type: 'bar',
        data: {
          labels: popularSkills,
          datasets: [
            {
              label: 'Freelancer Count',
              data: popularCounts,
              backgroundColor: 'rgba(54, 162, 235, 0.8)'
            }
          ]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Most Popular Skills Among Freelancers'
            }
          }
        }
      });
      
      // Demanded skills chart
      const demandedSkills = analyticsData.demandedSkills.map(skill => skill._id);
      const demandedCounts = analyticsData.demandedSkills.map(skill => skill.count);
      const avgBudget = analyticsData.demandedSkills.map(skill => skill.avgBudget);
      
      const newChart = new Chart(demandedCtx, {
        type: 'bar',
        data: {
          labels: demandedSkills,
          datasets: [
            {
              label: 'Project Count',
              data: demandedCounts,
              backgroundColor: 'rgba(255, 99, 132, 0.8)',
              yAxisID: 'y'
            },
            {
              label: 'Average Budget ($)',
              data: avgBudget,
              backgroundColor: 'rgba(75, 192, 192, 0.8)',
              type: 'line',
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Most Demanded Skills in Projects'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              position: 'left',
              title: {
                display: true,
                text: 'Project Count'
              }
            },
            y1: {
              beginAtZero: true,
              position: 'right',
              grid: {
                drawOnChartArea: false
              },
              title: {
                display: true,
                text: 'Average Budget ($)'
              }
            }
          }
        }
      });
      
      setSkillsChart(newChart);
    }
  };

  const handleDownloadCSV = () => {
    let csvContent = '';
    
    if (activeTab === 'growth') {
      // Generate CSV for growth data
      csvContent = 'Period,New Users,Freelancers,Clients,New Projects\n';
      analyticsData.userGrowth.forEach((item, index) => {
        const period = timeFilter === 'monthly' 
          ? `${item._id.month}/${item._id.year}`
          : timeFilter === 'weekly'
            ? `Week ${item._id.week}, ${item._id.year}`
            : `${item._id.day}/${item._id.month}/${item._id.year}`;
        
        const projectData = analyticsData.projectGrowth[index] || { newProjects: 0 };
        
        csvContent += `${period},${item.newUsers},${item.freelancers},${item.clients},${projectData.newProjects}\n`;
      });
    } else if (activeTab === 'revenue') {
      // Generate CSV for revenue data
      csvContent = 'Period,Revenue,Transactions,Projected\n';
      analyticsData.revenue.forEach(item => {
        csvContent += `${item._id.month}/${item._id.year},${item.totalRevenue},${item.transactionCount},No\n`;
      });
      
      if (analyticsData.projections) {
        const lastDataPoint = analyticsData.revenue[analyticsData.revenue.length - 1];
        analyticsData.projections.forEach((projection, index) => {
          let nextMonth = lastDataPoint._id.month + index + 1;
          let nextYear = lastDataPoint._id.year;
          
          if (nextMonth > 12) {
            nextMonth = nextMonth - 12;
            nextYear += 1;
          }
          
          csvContent += `${nextMonth}/${nextYear},${projection.projectedRevenue},N/A,Yes\n`;
        });
      }
    } else if (activeTab === 'skills') {
      // Generate CSV for skills data
      csvContent = 'Skill,Freelancer Count\n';
      analyticsData.popularSkills.forEach(skill => {
        csvContent += `${skill._id},${skill.count}\n`;
      });
      
      csvContent += '\nSkill,Project Count,Average Budget\n';
      analyticsData.demandedSkills.forEach(skill => {
        csvContent += `${skill._id},${skill.count},${skill.avgBudget.toFixed(2)}\n`;
      });
    }
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `skillswap-analytics-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchAnalyticsData}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="platform-analytics">
      <div className="analytics-header">
        <h1>Platform Analytics Dashboard</h1>
        <div className="analytics-actions">
          <div className="time-filter">
            <label>Time Period:</label>
            <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <button className="export-button" onClick={handleDownloadCSV}>
            Export to CSV
          </button>
        </div>
      </div>
      
      <div className="analytics-navigation">
        <button 
          className={activeTab === 'growth' ? 'active' : ''} 
          onClick={() => setActiveTab('growth')}
        >
          Growth Metrics
        </button>
        <button 
          className={activeTab === 'revenue' ? 'active' : ''} 
          onClick={() => setActiveTab('revenue')}
        >
          Revenue & Forecasting
        </button>
        <button 
          className={activeTab === 'skills' ? 'active' : ''} 
          onClick={() => setActiveTab('skills')}
        >
          Skills Analysis
        </button>
        <button 
          className={activeTab === 'verification' ? 'active' : ''} 
          onClick={() => setActiveTab('verification')}
        >
          Verification Stats
        </button>
      </div>
      
      <div className="analytics-content">
        {activeTab === 'growth' && (
          <div className="growth-metrics">
            <div className="summary-cards">
              <div className="summary-card">
                <h3>Total Users</h3>
                <p className="big-number">
                  {analyticsData.userGrowth.reduce((sum, item) => sum + item.newUsers, 0)}
                </p>
                <div className="breakdown">
                  <span>Freelancers: {analyticsData.userGrowth.reduce((sum, item) => sum + item.freelancers, 0)}</span>
                  <span>Clients: {analyticsData.userGrowth.reduce((sum, item) => sum + item.clients, 0)}</span>
                </div>
              </div>
              
              <div className="summary-card">
                <h3>Total Projects</h3>
                <p className="big-number">
                  {analyticsData.projectGrowth.reduce((sum, item) => sum + item.newProjects, 0)}
                </p>
                <div className="breakdown">
                  <span>Avg Budget: ${(analyticsData.projectGrowth.reduce((sum, item) => sum + item.totalBudget, 0) / analyticsData.projectGrowth.reduce((sum, item) => sum + item.newProjects, 0)).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="chart-container">
              <canvas id="growthChart"></canvas>
            </div>
          </div>
        )}
        
        {activeTab === 'revenue' && (
          <div className="revenue-analytics">
            <div className="summary-cards">
              <div className="summary-card">
                <h3>Total Revenue</h3>
                <p className="big-number">
                  ${analyticsData.revenue.reduce((sum, item) => sum + item.totalRevenue, 0).toFixed(2)}
                </p>
                <div className="breakdown">
                  <span>Transactions: {analyticsData.revenue.reduce((sum, item) => sum + item.transactionCount, 0)}</span>
                </div>
              </div>
              
              <div className="summary-card">
                <h3>Projected Growth</h3>
                <p className="big-number">
                  {analyticsData.projections && analyticsData.projections.length > 0 ? 
                    `${(((analyticsData.projections[analyticsData.projections.length - 1].projectedRevenue / analyticsData.revenue[analyticsData.revenue.length - 1].totalRevenue) - 1) * 100).toFixed(1)}%` : 
                    'N/A'}
                </p>
                <div className="breakdown">
                  <span>3-Month Projection</span>
                </div>
              </div>
            </div>
            
            <div className="chart-container">
              <canvas id="revenueChart"></canvas>
            </div>
          </div>
        )}
        
        {activeTab === 'skills' && (
          <div className="skills-analytics">
            <div className="skills-charts">
              <div className="chart-container skills-chart">
                <canvas id="popularSkillsChart"></canvas>
              </div>
              
              <div className="chart-container skills-chart">
                <canvas id="demandedSkillsChart"></canvas>
              </div>
            </div>
            
            <div className="skills-insights">
              <h3>Skills Insights</h3>
              <p>
                The most in-demand skills with the highest average budget are:
                {analyticsData.demandedSkills
                  .sort((a, b) => b.avgBudget - a.avgBudget)
                  .slice(0, 3)
                  .map((skill, index) => (
                    <span key={index} className="highlighted-skill">
                      {skill._id} (${skill.avgBudget.toFixed(2)})
                    </span>
                  ))}
              </p>
              <p>
                Skills with supply-demand gap:
                {analyticsData.demandedSkills
                  .filter(demanded => {
                    const supply = analyticsData.popularSkills.find(s => s._id === demanded._id);
                    return !supply || demanded.count > supply.count;
                  })
                  .slice(0, 3)
                  .map((skill, index) => (
                    <span key={index} className="highlighted-skill">
                      {skill._id}
                    </span>
                  ))}
              </p>
            </div>
          </div>
        )}
        
        {activeTab === 'verification' && (
          <div className="verification-stats">
            <div className="summary-cards">
              <div className="summary-card">
                <h3>Total Freelancers</h3>
                <p className="big-number">{analyticsData.verificationStats.totalFreelancers || 0}</p>
              </div>
              
              <div className="verification-breakdown">
                <h3>Verification Status</h3>
                <div className="verification-stats-container">
                  {analyticsData.verificationStats.verificationStats && 
                   analyticsData.verificationStats.verificationStats.map((stat, index) => (
                    <div className="verification-stat-item" key={index}>
                      <div className="stat-label">{stat._id || 'Unverified'}</div>
                      <div 
                        className="stat-bar" 
                        style={{ 
                          width: `${(stat.count / analyticsData.verificationStats.totalFreelancers) * 100}%`,
                          backgroundColor: 
                            stat._id === 'verified' ? '#4CAF50' : 
                            stat._id === 'pending' ? '#FFC107' : 
                            stat._id === 'rejected' ? '#F44336' : '#9E9E9E'
                        }}
                      ></div>
                      <div className="stat-value">
                        {stat.count} ({((stat.count / analyticsData.verificationStats.totalFreelancers) * 100).toFixed(1)}%)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="verification-actions">
              <h3>Verification Management</h3>
              <div className="action-buttons">
                <button className="action-button">View Pending Requests</button>
                <button className="action-button">Download Verification Report</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatformAnalytics;