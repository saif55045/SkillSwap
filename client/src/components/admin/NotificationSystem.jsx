import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import './NotificationSystem.css';

const NotificationSystem = () => {
  const [templates, setTemplates] = useState({});
  const [activeTab, setActiveTab] = useState('verification');
  const [activeType, setActiveType] = useState('');
  const [activeTemplate, setActiveTemplate] = useState({
    category: '',
    type: '',
    channel: 'email',
    content: ''
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [editMode, setEditMode] = useState(false);

  // Form data for sending notifications
  const [notificationForm, setNotificationForm] = useState({
    userId: '',
    type: '',
    projectId: '',
    projectName: '',
    amount: '',
    milestoneName: '',
    daysLeft: '',
    feedback: ''
  });

  useEffect(() => {
    fetchTemplates();
    fetchUsers();
  }, []);

  // Fetch notification templates
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/notifications/admin/templates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTemplates(response.data.data);
      
      // Set initial active type based on the first available template
      const firstCategory = Object.keys(response.data.data)[0];
      const firstType = Object.keys(response.data.data[firstCategory])[0];
      
      setActiveTab(firstCategory);
      setActiveType(firstType);
      setActiveTemplate({
        category: firstCategory,
        type: firstType,
        channel: 'email',
        content: response.data.data[firstCategory][firstType].email
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching notification templates:', err);
      setError('Failed to fetch notification templates. Please try again.');
      setLoading(false);
    }
  };

  // Fetch users for notification targeting
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUsers(response.data.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users for notification targets.');
    }
  };

  // Handle template selection
  const handleTemplateSelection = (category, type, channel) => {
    if (templates[category] && templates[category][type] && templates[category][type][channel]) {
      setActiveTemplate({
        category,
        type,
        channel,
        content: templates[category][type][channel]
      });
      setActiveTab(category);
      setActiveType(type);
      setEditMode(false);
    }
  };

  // Handle template content change
  const handleTemplateChange = (e) => {
    setActiveTemplate({
      ...activeTemplate,
      content: e.target.value
    });
  };

  // Update template
  const updateTemplate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/notifications/admin/templates`,
        {
          category: activeTemplate.category,
          type: activeTemplate.type,
          channel: activeTemplate.channel,
          template: activeTemplate.content
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Update local state
      setTemplates(prev => ({
        ...prev,
        [activeTemplate.category]: {
          ...prev[activeTemplate.category],
          [activeTemplate.type]: {
            ...prev[activeTemplate.category][activeTemplate.type],
            [activeTemplate.channel]: activeTemplate.content
          }
        }
      }));
      
      setSuccessMessage('Template updated successfully!');
      setEditMode(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error updating template:', err);
      setError('Failed to update template. Please try again.');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  // Handle notification form changes
  const handleFormChange = (e) => {
    setNotificationForm({
      ...notificationForm,
      [e.target.name]: e.target.value
    });
  };

  // Toggle user selection for batch notifications
  const toggleUserSelection = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  // Send notification
  const sendNotification = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      let endpoint;
      let payload;
      
      switch (activeTab) {
        case 'verification':
          endpoint = `${API_URL}/notifications/admin/verification`;
          payload = {
            userId: notificationForm.userId,
            status: activeType,
            feedback: notificationForm.feedback
          };
          break;
        case 'project':
          endpoint = `${API_URL}/notifications/admin/project`;
          payload = {
            userId: notificationForm.userId,
            projectId: notificationForm.projectId,
            projectName: notificationForm.projectName,
            type: activeType
          };
          break;
        case 'payment':
          endpoint = `${API_URL}/notifications/admin/payment`;
          payload = {
            userId: notificationForm.userId,
            amount: notificationForm.amount,
            projectName: notificationForm.projectName,
            type: activeType
          };
          break;
        case 'milestone':
          endpoint = `${API_URL}/notifications/admin/milestone`;
          payload = {
            userId: notificationForm.userId,
            milestoneName: notificationForm.milestoneName,
            projectName: notificationForm.projectName,
            daysLeft: notificationForm.daysLeft,
            type: activeType
          };
          break;
        default:
          throw new Error('Invalid notification category');
      }
      
      if (selectedUsers.length > 0) {
        // Send batch notifications
        for (const userId of selectedUsers) {
          await axios.post(
            endpoint,
            { ...payload, userId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
        setSuccessMessage(`Sent notifications to ${selectedUsers.length} users!`);
      } else {
        // Send single notification
        await axios.post(
          endpoint,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccessMessage('Notification sent successfully!');
      }
      
      // Reset form after sending
      setNotificationForm({
        userId: '',
        type: '',
        projectId: '',
        projectName: '',
        amount: '',
        milestoneName: '',
        daysLeft: '',
        feedback: ''
      });
      
      setSelectedUsers([]);
      setLoading(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error sending notification:', err);
      setError('Failed to send notification. Please check your inputs and try again.');
      setLoading(false);
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  // Get required fields based on active tab
  const getRequiredFields = () => {
    switch (activeTab) {
      case 'verification':
        return (
          <>
            <div className="form-group">
              <label>User</label>
              <select 
                name="userId" 
                value={notificationForm.userId} 
                onChange={handleFormChange}
                required
              >
                <option value="">Select User</option>
                {users.filter(user => user.role === 'freelancer').map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Feedback</label>
              <textarea 
                name="feedback" 
                placeholder="Optional feedback message"
                value={notificationForm.feedback} 
                onChange={handleFormChange}
              />
            </div>
          </>
        );
      case 'project':
        return (
          <>
            <div className="form-group">
              <label>User</label>
              <select 
                name="userId" 
                value={notificationForm.userId} 
                onChange={handleFormChange}
                required
              >
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Project ID</label>
              <input 
                type="text" 
                name="projectId" 
                placeholder="Project ID"
                value={notificationForm.projectId} 
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Project Name</label>
              <input 
                type="text" 
                name="projectName" 
                placeholder="Project Name"
                value={notificationForm.projectName} 
                onChange={handleFormChange}
                required
              />
            </div>
          </>
        );
      case 'payment':
        return (
          <>
            <div className="form-group">
              <label>User</label>
              <select 
                name="userId" 
                value={notificationForm.userId} 
                onChange={handleFormChange}
                required
              >
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Amount</label>
              <input 
                type="number" 
                name="amount" 
                placeholder="Payment Amount"
                value={notificationForm.amount} 
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Project Name</label>
              <input 
                type="text" 
                name="projectName" 
                placeholder="Project Name"
                value={notificationForm.projectName} 
                onChange={handleFormChange}
                required
              />
            </div>
          </>
        );
      case 'milestone':
        return (
          <>
            <div className="form-group">
              <label>User</label>
              <select 
                name="userId" 
                value={notificationForm.userId} 
                onChange={handleFormChange}
                required
              >
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Milestone Name</label>
              <input 
                type="text" 
                name="milestoneName" 
                placeholder="Milestone Name"
                value={notificationForm.milestoneName} 
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Project Name</label>
              <input 
                type="text" 
                name="projectName" 
                placeholder="Project Name"
                value={notificationForm.projectName} 
                onChange={handleFormChange}
                required
              />
            </div>
            {activeType === 'approaching' && (
              <div className="form-group">
                <label>Days Left</label>
                <input 
                  type="number" 
                  name="daysLeft" 
                  placeholder="Days Left"
                  value={notificationForm.daysLeft} 
                  onChange={handleFormChange}
                  required
                />
              </div>
            )}
          </>
        );
      default:
        return null;
    }
  };

  if (loading && Object.keys(templates).length === 0) {
    return (
      <div className="notification-loading">
        <div className="loading-spinner"></div>
        <p>Loading notification system...</p>
      </div>
    );
  }

  return (
    <div className="notification-system">
      <div className="notification-header">
        <h1>Notification System</h1>
        <p>Manage notification templates and send notifications to users</p>
      </div>
      
      {error && (
        <div className="notification-error">
          <p>{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="notification-success">
          <p>{successMessage}</p>
        </div>
      )}
      
      <div className="notification-container">
        <div className="template-section">
          <h2>Notification Templates</h2>
          
          <div className="template-navigation">
            {Object.keys(templates).map(category => (
              <button 
                key={category}
                className={activeTab === category ? 'active' : ''}
                onClick={() => setActiveTab(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="template-types">
            {templates[activeTab] && Object.keys(templates[activeTab]).map(type => (
              <div 
                key={type}
                className={`template-type ${activeType === type ? 'active' : ''}`}
                onClick={() => handleTemplateSelection(activeTab, type, activeTemplate.channel)}
              >
                <span className="type-name">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
              </div>
            ))}
          </div>
          
          <div className="template-editor">
            <div className="template-channels">
              <button 
                className={activeTemplate.channel === 'email' ? 'active' : ''}
                onClick={() => handleTemplateSelection(activeTab, activeType, 'email')}
              >
                Email
              </button>
              <button 
                className={activeTemplate.channel === 'sms' ? 'active' : ''}
                onClick={() => handleTemplateSelection(activeTab, activeType, 'sms')}
              >
                SMS
              </button>
            </div>
            
            <div className="template-content">
              <textarea
                value={activeTemplate.content}
                onChange={handleTemplateChange}
                disabled={!editMode}
              />
              
              <div className="template-actions">
                {!editMode ? (
                  <button className="edit-button" onClick={() => setEditMode(true)}>
                    Edit Template
                  </button>
                ) : (
                  <>
                    <button className="save-button" onClick={updateTemplate}>
                      Save Changes
                    </button>
                    <button 
                      className="cancel-button" 
                      onClick={() => {
                        setEditMode(false);
                        // Reset content to original
                        setActiveTemplate({
                          ...activeTemplate,
                          content: templates[activeTemplate.category][activeTemplate.type][activeTemplate.channel]
                        });
                      }}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
              
              <div className="template-variables">
                <h4>Available Variables:</h4>
                <ul>
                  {activeTab === 'project' && (
                    <li><code>{'{{projectName}}'}</code> - Name of the project</li>
                  )}
                  {activeTab === 'payment' && (
                    <>
                      <li><code>{'{{amount}}'}</code> - Payment amount</li>
                      <li><code>{'{{projectName}}'}</code> - Name of the project</li>
                    </>
                  )}
                  {activeTab === 'milestone' && (
                    <>
                      <li><code>{'{{milestoneName}}'}</code> - Name of the milestone</li>
                      <li><code>{'{{projectName}}'}</code> - Name of the project</li>
                      {activeType === 'approaching' && (
                        <li><code>{'{{daysLeft}}'}</code> - Days until milestone due</li>
                      )}
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="notification-sender">
          <h2>Send Notifications</h2>
          <form onSubmit={sendNotification}>
            <div className="form-group">
              <label>Notification Type</label>
              <p className="notification-type">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} - {activeType.charAt(0).toUpperCase() + activeType.slice(1)}
              </p>
            </div>
            
            {getRequiredFields()}
            
            <div className="batch-notification">
              <h3>Batch Send</h3>
              <p>Select multiple users to send the same notification:</p>
              
              <div className="user-selection">
                {users.slice(0, 5).map(user => (
                  <div key={user._id} className="user-checkbox">
                    <input
                      type="checkbox"
                      id={`user-${user._id}`}
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => toggleUserSelection(user._id)}
                    />
                    <label htmlFor={`user-${user._id}`}>
                      {user.name} ({user.email})
                    </label>
                  </div>
                ))}
                {users.length > 5 && (
                  <div className="more-users">
                    + {users.length - 5} more users available
                  </div>
                )}
              </div>
            </div>
            
            <button type="submit" className="send-button" disabled={loading}>
              {loading ? 'Sending...' : 'Send Notification'}
            </button>
          </form>
        </div>
      </div>
      
      <div className="notification-logs">
        <h2>Recent Notification Activity</h2>
        <p className="coming-soon">Detailed notification logs feature coming soon...</p>
      </div>
    </div>
  );
};

export default NotificationSystem;