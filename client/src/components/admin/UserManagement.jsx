import { useState, useEffect } from 'react';
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        role: 'all',
        page: 1
    });
    const [stats, setStats] = useState({
        usersByRole: {},
        newUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0
    });
    const [totalPages, setTotalPages] = useState(1);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        role: '',
        isActive: true
    });

    // Fetch users on component mount and when filters change
    useEffect(() => {
        fetchUsers();
        fetchUserStats();
    }, [filters.page, filters.role]);

    // Fetch filtered users from the API
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (filters.search) queryParams.append('search', filters.search);
            if (filters.role !== 'all') queryParams.append('role', filters.role);
            queryParams.append('page', filters.page);
            queryParams.append('limit', 10);

            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/admin/users?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data.data);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch user statistics
    const fetchUserStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/admin/users/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user statistics');
            }

            const data = await response.json();
            setStats(data.data);
        } catch (err) {
            console.error('Error fetching user stats:', err);
        }
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
    };

    // Handle search form submission
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchUsers();
    };

    // Handle role filter change
    const handleRoleFilter = (e) => {
        setFilters(prev => ({ ...prev, role: e.target.value, page: 1 }));
    };

    // Handle pagination
    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    // Handle user selection for viewing details
    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setIsEditing(false);
    };

    // Handle edit mode activation
    const handleEditClick = () => {
        setIsEditing(true);
        setEditForm({
            name: selectedUser.name,
            email: selectedUser.email,
            role: selectedUser.role,
            isActive: selectedUser.isActive
        });
    };

    // Handle edit form input changes
    const handleEditFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle user update
    const handleUpdateUser = async (e) => {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/admin/users/${selectedUser._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            });

            if (!response.ok) {
                throw new Error('Failed to update user');
            }

            const updatedUser = await response.json();
            
            // Update the user in the local state
            setUsers(users.map(user => 
                user._id === selectedUser._id ? { ...user, ...editForm } : user
            ));
            
            setSelectedUser({ ...selectedUser, ...editForm });
            setIsEditing(false);
            alert('User updated successfully');
        } catch (err) {
            console.error('Error updating user:', err);
            alert('Failed to update user. Please try again.');
        }
    };

    // Handle closing the user details panel
    const handleCloseDetails = () => {
        setSelectedUser(null);
        setIsEditing(false);
    };

    return (
        <div className="user-management-container">
            <div className="user-management-header">
                <h2>User Management</h2>
                <p>Manage all users of the SkillSwap platform</p>
            </div>

            {/* User statistics */}
            <div className="user-stats-container">
                <div className="stat-card">
                    <h3>Total Clients</h3>
                    <div className="stat-value">{stats.usersByRole?.client || 0}</div>
                </div>
                <div className="stat-card">
                    <h3>Total Freelancers</h3>
                    <div className="stat-value">{stats.usersByRole?.freelancer || 0}</div>
                </div>
                <div className="stat-card">
                    <h3>New Users (30d)</h3>
                    <div className="stat-value">{stats.newUsers || 0}</div>
                </div>
                <div className="stat-card">
                    <h3>Active Users</h3>
                    <div className="stat-value">{stats.activeUsers || 0}</div>
                </div>
            </div>

            {/* Search and filters */}
            <div className="user-filters-container">
                <form onSubmit={handleSearchSubmit} className="search-form">
                    <input
                        type="text"
                        placeholder="Search users by name or email"
                        value={filters.search}
                        onChange={handleSearchChange}
                    />
                    <button type="submit">Search</button>
                </form>

                <div className="filter-controls">
                    <select 
                        value={filters.role} 
                        onChange={handleRoleFilter}
                    >
                        <option value="all">All Roles</option>
                        <option value="client">Clients</option>
                        <option value="freelancer">Freelancers</option>
                        <option value="admin">Admins</option>
                    </select>
                </div>
            </div>

            {/* User list and details section */}
            <div className="user-content-container">
                {/* User list */}
                <div className="user-list-container">
                    {loading ? (
                        <div className="loading-message">Loading users...</div>
                    ) : error ? (
                        <div className="error-message">{error}</div>
                    ) : (
                        <>
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user._id} className={user._id === selectedUser?._id ? 'selected' : ''}>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={`role-badge role-${user.role}`}>{user.role}</span>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <button 
                                                    className="view-button" 
                                                    onClick={() => handleSelectUser(user)}
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            <div className="pagination-controls">
                                <button 
                                    onClick={() => handlePageChange(filters.page - 1)}
                                    disabled={filters.page === 1}
                                >
                                    Previous
                                </button>
                                <span className="page-info">
                                    Page {filters.page} of {totalPages}
                                </span>
                                <button 
                                    onClick={() => handlePageChange(filters.page + 1)}
                                    disabled={filters.page === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* User details panel */}
                {selectedUser && (
                    <div className="user-details-panel">
                        <div className="details-header">
                            <h3>{isEditing ? 'Edit User' : 'User Details'}</h3>
                            <button className="close-button" onClick={handleCloseDetails}>×</button>
                        </div>
                        
                        {isEditing ? (
                            <form onSubmit={handleUpdateUser} className="edit-user-form">
                                <div className="form-group">
                                    <label>Name:</label>
                                    <input 
                                        type="text" 
                                        name="name"
                                        value={editForm.name}
                                        onChange={handleEditFormChange}
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Email:</label>
                                    <input 
                                        type="email" 
                                        name="email"
                                        value={editForm.email}
                                        onChange={handleEditFormChange}
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Role:</label>
                                    <select 
                                        name="role"
                                        value={editForm.role}
                                        onChange={handleEditFormChange}
                                        required
                                    >
                                        <option value="client">Client</option>
                                        <option value="freelancer">Freelancer</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                
                                <div className="form-group checkbox-group">
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            name="isActive"
                                            checked={editForm.isActive}
                                            onChange={handleEditFormChange}
                                        />
                                        Active
                                    </label>
                                </div>
                                
                                <div className="form-actions">
                                    <button type="submit" className="save-button">Save Changes</button>
                                    <button 
                                        type="button" 
                                        className="cancel-button"
                                        onClick={() => setIsEditing(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="user-details">
                                <div className="detail-item">
                                    <span className="label">ID:</span>
                                    <span className="value">{selectedUser._id}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Name:</span>
                                    <span className="value">{selectedUser.name}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Email:</span>
                                    <span className="value">{selectedUser.email}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Role:</span>
                                    <span className="value role-badge role-{selectedUser.role}">{selectedUser.role}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Status:</span>
                                    <span className={`value status-badge ${selectedUser.isActive ? 'active' : 'inactive'}`}>
                                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Created:</span>
                                    <span className="value">
                                        {new Date(selectedUser.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                
                                <div className="detail-actions">
                                    <button onClick={handleEditClick} className="edit-button">Edit User</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;