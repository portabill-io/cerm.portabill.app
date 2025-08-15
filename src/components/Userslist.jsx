import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  RotateCcw
} from 'lucide-react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import './component.css';

const availableModules = [
  'Enquiries',
  'Quotations',
  'Purchase Orders',
  'Job Orders',
  'Invoices',
  'Receipts',
  'Accounts Ledger',
  'Clients',
  'Users & Permissions'
];

// Helper function to normalize module names for comparison
const normalizeModuleName = (moduleName) => {
  return moduleName.toLowerCase().replace(/\s+/g, '').replace(/&/g, '');
};

// Helper function to find matching module name from availableModules
const findMatchingModule = (apiModule) => {
  const normalizedApi = normalizeModuleName(apiModule);
  return availableModules.find(module => 
    normalizeModuleName(module) === normalizedApi
  ) || apiModule; // fallback to original if no match found
};

const Userslist = () => {
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'Manager',
    modulePermissions: []
  });

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/user-access', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Ensure we always get an array
      let data = response.data;
      let usersArr = [];
      if (Array.isArray(data)) {
        usersArr = data;
      } else if (data && Array.isArray(data.users)) {
        usersArr = data.users;
      } else if (data && Array.isArray(data.data)) {
        usersArr = data.data;
      }

      // Transform backend fields to frontend fields
      const mappedUsers = usersArr.map(u => {
        // Map module permissions to proper case
        let modulePermissions = [];
        
        // Handle module_permissions whether it's a string or array
        let rawPermissions = u.module_permissions;
        
        if (typeof rawPermissions === 'string') {
          try {
            // Parse JSON string to array
            rawPermissions = JSON.parse(rawPermissions);
          } catch (error) {
            console.error('Error parsing module permissions:', error);
            rawPermissions = [];
          }
        }
        
        if (Array.isArray(rawPermissions)) {
          modulePermissions = rawPermissions.map(apiModule => 
            findMatchingModule(apiModule)
          );
        }

        return {
          ...u,
          fullName: u.full_name ?? '',
          modulePermissions: modulePermissions
        };
      });

      console.log('Fetched users:', mappedUsers); // Debug log
      setUsers(mappedUsers);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch users';
      toast.error(`Error: ${message}`);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleModuleToggle = (module) => {
    setFormData(prev => {
      const exists = prev.modulePermissions.includes(module);
      return {
        ...prev,
        modulePermissions: exists
          ? prev.modulePermissions.filter((m) => m !== module)
          : [...prev.modulePermissions, module]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email) {
      toast.warn('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Convert module permissions to API format (lowercase)
      const apiModulePermissions = formData.modulePermissions.map(module => 
        normalizeModuleName(module)
      );
      
      if (editingUser) {
        // Update existing user
        const updatePayload = {
          user_id: editingUser.user_id || editingUser.id,
          full_name: formData.fullName,
          email: formData.email,
          role: formData.role,
          module_permissions: apiModulePermissions
        };

        const response = await axios.put(`/user-access/${editingUser.id || editingUser._id}`, updatePayload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        toast.success('User updated successfully!');
        handleClear();
        setShowForm(false);
        fetchUsers();
      } else {
        // Create new user
        const createPayload = {
          user_id: generateNextUserId(),
          full_name: formData.fullName,
          email: formData.email,
          role: formData.role,
          module_permissions: apiModulePermissions
        };

        const response = await axios.post('/user-access', createPayload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        toast.success('User added successfully!');
        handleClear();
        setShowForm(false);
        fetchUsers();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Something went wrong';
      toast.error(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      role: user.role || 'Manager',
      modulePermissions: Array.isArray(user.modulePermissions) ? user.modulePermissions : []
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(`/user-access/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setUsers(prev => prev.filter(user => user.id !== id));
      toast.success('User deleted successfully!');
      fetchUsers();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete user';
      toast.error(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      fullName: '',
      email: '',
      role: 'Manager',
      modulePermissions: []
    });
    setEditingUser(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    handleClear();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return '#3b82f6';
      case 'Manager': return '#10b981';
      case 'Accountant': return '#f59e0b';
      default: return '#9ca3af';
    }
  };

  const generateNextUserId = () => {
    if (!Array.isArray(users) || users.length === 0) {
      return 'USR-001';
    }
    
    const maxId = Math.max(...users.map(u => {
      const idField = u.user_id || u.id;
      if (!idField) return 0;
      const idParts = idField.split('-');
      return idParts && idParts[1] ? parseInt(idParts[1]) || 0 : 0;
    }));
    
    return `USR-${String(maxId + 1).padStart(3, '0')}`;
  };

  // Filter users based on search term
  const filteredUsers = Array.isArray(users) ? users.filter(user =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.id?.toString() ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="enquiries-container">
      <style jsx>{`
        .user-cards {
          display: none;
        }

        .user-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #f3f4f6;
        }

        .card-id {
          font-weight: 600;
          color: #111827;
          font-size: 14px;
        }

        .card-name {
          font-weight: 600;
          color: #111827;
          font-size: 14px;
        }

        .card-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 12px;
        }

        .card-field {
          display: flex;
          flex-direction: column;
        }

        .card-label {
          font-size: 11px;
          color: #6b7280;
          text-transform: uppercase;
          font-weight: 500;
          letter-spacing: 0.05em;
          margin-bottom: 2px;
        }

        .card-value {
          font-size: 13px;
          color: #374151;
          font-weight: 500;
        }

        .card-role {
          text-align: center;
          background: #f9fafb;
          padding: 6px 12px;
          border-radius: 6px;
        }

        .card-role .card-value {
          font-weight: 600;
        }

        .card-modules {
          grid-column: span 2;
        }

        .module-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 4px;
        }

        .module-chip {
          background: #f3f4f6;
          border-radius: 12px;
          padding: 2px 8px;
          font-size: 11px;
          color: #374151;
        }

        .card-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          padding-top: 8px;
          border-top: 1px solid #f3f4f6;
        }

        .module-checkboxes {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }

        .module-checkbox {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
        }

        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          color: white;
          font-size: 18px;
        }

        @media (max-width: 768px) {
          .table-wrapper {
            display: none;
          }

          .user-cards {
            display: block;
            padding: 0 16px 32px;
          }
          
          .user-card:last-child {
            margin-bottom: 24px;
          }
          
          .page-header {
            padding: 0 16px;
          }

          .table-header {
            padding: 16px;
          }
        }

        @media (max-width: 480px) {
          .card-content {
            grid-template-columns: 1fr;
          }

          .card-modules {
            grid-column: span 1;
          }

          .card-actions {
            justify-content: center;
          }
        }
      `}</style>

 

      <div className="page-header">
        <div className="header-actions">
          <div className="action-buttons">
            <button className="add-btn" onClick={() => setShowForm(true)}>
              <Plus size={20} />
              <span>Add User</span>
            </button>
            <button 
              className="export-btn" 
              onClick={() => {
                const dataStr = JSON.stringify(filteredUsers, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                const exportFileDefaultName = 'users-export.json';
                
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Export</span>
            </button>
          </div>
          <div className="search-container">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search users..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .header-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }
        
        .action-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        
        .add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background-color: #3b82f6;
          color: white;
          border: 1px solid #3b82f6;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        
        .add-btn:hover {
          background-color: #2563eb;
          border-color: #2563eb;
        }
        
        .export-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background-color: #f3f4f6;
          color: #374151;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        
        .export-btn:hover {
          background-color: #e5e7eb;
        }
        
        .search-container {
          position: relative;
          width: 100%;
          min-width: 200px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .search-input {
          width: 100%;
          padding: 8px 12px 8px 36px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.2s ease;
          background-color: white;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }

        @media (min-width: 768px) {
          .header-actions {
            flex-direction: row;
            align-items: center;
          }
          
          .search-container {
            width: auto;
            max-width: 300px;
          }
        }
      `}</style>

      <div className="table-container">
        <div className="table-header">
          <h3 className="table-title">User Management</h3>
        </div>

        {/* Desktop Table View */}
        <div className="table-wrapper">
          <table className="enquiries-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Access Modules</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id || user._id}>
                  <td>{user.user_id || user.id}</td>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getRoleColor(user.role) }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {Array.isArray(user.modulePermissions) && user.modulePermissions.length > 0 ? (
                        user.modulePermissions.map((mod, index) => (
                          <span key={`${mod}-${index}`} style={{ 
                            background: '#f3f4f6',
                            borderRadius: '12px',
                            padding: '2px 8px',
                            fontSize: '12px'
                          }}>
                            {mod}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: '12px', fontStyle: 'italic' }}>
                          No modules assigned
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="actions">
                    <button 
                      className="edit-btn" 
                      title="Edit"
                      onClick={() => handleEdit(user)}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(user.id || user._id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="user-cards">
          {filteredUsers.map((user) => (
            <div key={user.id || user._id} className="user-card">
              <div className="card-header">
                <div>
                  <div className="card-id">{user.user_id || user.id}</div>
                  <div className="card-name">{user.fullName}</div>
                </div>
                <div className="card-actions">
                  <button 
                    className="edit-btn" 
                    title="Edit"
                    onClick={() => handleEdit(user)}
                  >
                    <Edit size={14} />
                  </button>
                  <button 
                    className="delete-btn" 
                    onClick={() => handleDelete(user.id || user._id)} 
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="card-content">
                <div className="card-field">
                  <div className="card-label">Email</div>
                  <div className="card-value">{user.email}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Role</div>
                  <div className="card-value" style={{ color: getRoleColor(user.role) }}>
                    {user.role}
                  </div>
                </div>
                <div className="card-field card-modules">
                  <div className="card-label">Access Modules</div>
                  <div className="module-list">
                    {Array.isArray(user.modulePermissions) && user.modulePermissions.length > 0 ? (
                      user.modulePermissions.map((mod, index) => (
                        <span key={`${mod}-${index}`} className="module-chip">{mod}</span>
                      ))
                    ) : (
                      <span style={{ color: '#9ca3af', fontSize: '11px', fontStyle: 'italic' }}>
                        No modules assigned
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <>
          <div className="modal-overlay" onClick={handleCloseForm}></div>
          <div className="form-modal">
            <div className="form-header">
              <h3 className="form-title">
                {editingUser ? 'Edit User' : 'Add User'}
              </h3>
              <button className="close-btn" onClick={handleCloseForm}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="enquiry-form">
              <div className="form-row">
                <div className="form-group">
                  <label>User ID {editingUser ? '' : '(Auto)'}</label>
                  <input
                    type="text"
                    value={editingUser ? (editingUser.user_id || editingUser.id) : generateNextUserId()}
                    readOnly
                    className="readonly-input"
                  />
                </div>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Accountant">Accountant</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Module Permissions</label>
                <div className="module-checkboxes">
                  {availableModules.map((mod) => (
                    <label key={mod} className="module-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.modulePermissions.includes(mod)}
                        onChange={() => handleModuleToggle(mod)}
                      />
                      {mod}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="clear-btn" onClick={handleClear}>
                  <RotateCcw size={16} />
                  <span>Clear</span>
                </button>
                <button type="submit" className="save-btn" disabled={loading}>
                  <Save size={16} />
                  <span>{loading ? 'Saving...' : (editingUser ? 'Update User' : 'Save User')}</span>
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Userslist;