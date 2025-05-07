import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { freelancerService } from '../../utils/freelancerService';

const EarningsTracker = () => {
    const { user } = useAuth();
    const [earnings, setEarnings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [syncMessage, setSyncMessage] = useState(null);
    const [filters, setFilters] = useState({
        period: 'all',
        status: 'all'
    });
    
    useEffect(() => {
        fetchEarnings();
    }, [filters]);

    const fetchEarnings = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await freelancerService.getEarnings(filters);
            console.log('Earnings response:', response); // Debug log
            setEarnings(response.data || []);
        } catch (err) {
            console.error('Error fetching earnings data:', err);
            setError('Failed to load earnings. Please try again later.');
            
            // If API fails, use sample data for development
            if (process.env.NODE_ENV === 'development') {
                setEarnings(sampleEarnings);
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle syncing missing earnings
    const handleSyncMissingEarnings = async () => {
        try {
            setLoading(true);
            setSyncMessage(null);
            const result = await freelancerService.syncMissingEarnings();
            setSyncMessage(`Success! ${result.newRecordsCount} missing earnings records were added.`);
            // Refresh earnings list to show the newly added records
            await fetchEarnings();
        } catch (err) {
            console.error('Error syncing missing earnings:', err);
            setSyncMessage('Failed to sync missing earnings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Sample earnings data for fallback during development
    const sampleEarnings = [
        {
            _id: '1',
            projectId: {
                _id: '1',
                title: 'E-commerce Website Development'
            },
            amount: 800,
            date: '2025-03-15T12:00:00Z',
            status: 'completed',
            clientId: {
                name: 'John Client'
            }
        },
        {
            _id: '2',
            projectId: {
                _id: '2',
                title: 'Company Logo Design'
            },
            amount: 350,
            date: '2025-03-25T15:30:00Z',
            status: 'pending',
            clientId: {
                name: 'Sarah Client'
            }
        },
        {
            _id: '3',
            projectId: {
                _id: '3',
                title: 'Mobile App UI Design'
            },
            amount: 600,
            date: '2025-02-10T09:15:00Z',
            status: 'completed',
            clientId: {
                name: 'Tech Solutions Inc.'
            }
        }
    ];

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const calculateTotalEarnings = (earningsList) => {
        return earningsList.reduce((total, earning) => total + earning.amount, 0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleExportData = async () => {
        try {
            await freelancerService.exportEarningsData(filters, 'csv');
        } catch (err) {
            console.error('Error exporting data:', err);
            alert('Failed to export earnings data');
        }
    };

    // Get filtered earnings directly from the database with the filters applied
    const filteredEarnings = earnings;

    const styles = {
        container: {
            padding: '20px'
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
        exportButton: {
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
        },
        statsContainer: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '20px'
        },
        statCard: {
            backgroundColor: '#f5f5f5',
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center'
        },
        statValue: {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1976d2'
        },
        statLabel: {
            color: '#666',
            fontSize: '14px',
            marginTop: '5px'
        },
        filters: {
            display: 'flex',
            gap: '15px',
            marginBottom: '20px'
        },
        select: {
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ccc'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse'
        },
        th: {
            backgroundColor: '#f5f5f5',
            padding: '10px 15px',
            textAlign: 'left',
            borderBottom: '1px solid #e0e0e0'
        },
        tr: {
            borderBottom: '1px solid #e0e0e0'
        },
        td: {
            padding: '12px 15px'
        },
        statusBadge: {
            display: 'inline-block',
            padding: '5px 10px',
            borderRadius: '20px',
            fontSize: '12px'
        },
        completedBadge: {
            backgroundColor: '#c8e6c9',
            color: '#388e3c'
        },
        pendingBadge: {
            backgroundColor: '#fff9c4',
            color: '#f57f17'
        },
        cancelledBadge: {
            backgroundColor: '#ffcdd2',
            color: '#d32f2f'
        }
    };

    const getStatusBadgeStyle = (status) => {
        switch(status) {
            case 'completed':
                return {...styles.statusBadge, ...styles.completedBadge};
            case 'pending':
                return {...styles.statusBadge, ...styles.pendingBadge};
            case 'cancelled':
                return {...styles.statusBadge, ...styles.cancelledBadge};
            default:
                return styles.statusBadge;
        }
    };

    return (
        <div style={styles.container}>
            {/* Header with export and sync buttons */}
            <div style={styles.header}>
                <h2 style={styles.heading}>Earnings Tracker</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        style={{
                            ...styles.exportButton,
                            backgroundColor: '#4caf50'
                        }}
                        onClick={handleExportData}
                    >
                        Export Data
                    </button>
                    <button 
                        style={{
                            ...styles.exportButton,
                            backgroundColor: '#2196f3'
                        }}
                        onClick={handleSyncMissingEarnings}
                    >
                        Sync Missing Earnings
                    </button>
                </div>
            </div>
            
            {/* Sync Message */}
            {syncMessage && (
                <div style={{
                    padding: '10px',
                    margin: '10px 0',
                    backgroundColor: syncMessage.includes('Success') ? '#e8f5e9' : '#ffebee',
                    borderRadius: '4px',
                    color: syncMessage.includes('Success') ? '#2e7d32' : '#c62828'
                }}>
                    {syncMessage}
                </div>
            )}
            
            {/* Stats Summary */}
            <div style={styles.statsContainer}>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>${calculateTotalEarnings(filteredEarnings)}</div>
                    <div style={styles.statLabel}>Total Earnings</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>
                        ${calculateTotalEarnings(earnings.filter(e => e.status === 'completed'))}
                    </div>
                    <div style={styles.statLabel}>Completed Earnings</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>
                        ${calculateTotalEarnings(earnings.filter(e => e.status === 'pending'))}
                    </div>
                    <div style={styles.statLabel}>Pending Earnings</div>
                </div>
            </div>
            
            {/* Filters */}
            <div style={styles.filters}>
                <select
                    name="period"
                    value={filters.period}
                    onChange={handleFilterChange}
                    style={styles.select}
                >
                    <option value="all">All Time</option>
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="year">Last Year</option>
                </select>
                <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    style={styles.select}
                >
                    <option value="all">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>
            
            {/* Earnings Table */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading earnings data...</div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
                    {error}
                </div>
            ) : filteredEarnings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <h3 style={{ marginBottom: '10px' }}>No earnings found</h3>
                    <p style={{ color: '#666' }}>No earnings match your current filter criteria</p>
                </div>
            ) : (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Project</th>
                            <th style={styles.th}>Client</th>
                            <th style={styles.th}>Amount</th>
                            <th style={styles.th}>Date</th>
                            <th style={styles.th}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEarnings.map(earning => (
                            <tr key={earning._id} style={styles.tr}>
                                <td style={styles.td}>{earning.projectId.title}</td>
                                <td style={styles.td}>{earning.clientId.name}</td>
                                <td style={styles.td}>${earning.amount}</td>
                                <td style={styles.td}>{formatDate(earning.date)}</td>
                                <td style={styles.td}>
                                    <span style={getStatusBadgeStyle(earning.status)}>
                                        {earning.status.charAt(0).toUpperCase() + earning.status.slice(1)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default EarningsTracker;