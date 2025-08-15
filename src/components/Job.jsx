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

const Job = () => {
  const [showForm, setShowForm] = useState(false);
  const [jobOrders, setJobOrders] = useState([]);
  const [editingJob, setEditingJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    linkedPo: '',
    taskDescription: '',
    assignedTo: '',
    startDate: '',
    endDate: '',
    status: 'Pending',
    notes: ''
  });

  // Fetch job orders on component mount
  useEffect(() => {
    fetchJobOrders();
  }, []);

  const fetchJobOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/job-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Ensure we always get an array
      let data = response.data;
      let jobOrdersArr = [];
      if (Array.isArray(data)) {
        jobOrdersArr = data;
      } else if (data && Array.isArray(data.jobOrders)) {
        jobOrdersArr = data.jobOrders;
      } else if (data && Array.isArray(data.data)) {
        jobOrdersArr = data.data;
      }

      // Transform backend fields to frontend fields
      const mappedJobOrders = jobOrdersArr.map(job => ({
        ...job,
        jobId: job.jobordid || job.id,
        linkedPo: job.linked_po || '',
        taskDescription: job.task_description || '',
        assignedTo: job.assigned_to || '',
        startDate: job.start_date ? job.start_date.split('T')[0] : '',
        endDate: job.end_date ? job.end_date.split('T')[0] : '',
        status: job.status || 'Pending',
        notes: job.notes || ''
      }));

      setJobOrders(mappedJobOrders);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch job orders';
      toast.error(`Error: ${message}`);
      setJobOrders([]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.linkedPo || !formData.taskDescription || !formData.assignedTo || 
        !formData.startDate || !formData.endDate) {
      toast.warn('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (editingJob) {
        // Update existing job order
        const updatePayload = {
          jobordid: editingJob.jobId || editingJob.jobordid,
          linked_po: formData.linkedPo,
          task_description: formData.taskDescription,
          assigned_to: formData.assignedTo,
          start_date: formData.startDate,
          end_date: formData.endDate,
          status: formData.status,
          notes: formData.notes
        };

        await axios.put(`/job-orders/${editingJob.id || editingJob._id}`, updatePayload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        toast.success('Job order updated successfully!');
        handleClear();
        setShowForm(false);
        fetchJobOrders();
      } else {
        // Create new job order
        const createPayload = {
          jobordid: generateNextJobId(),
          linked_po: formData.linkedPo,
          task_description: formData.taskDescription,
          assigned_to: formData.assignedTo,
          start_date: formData.startDate,
          end_date: formData.endDate,
          status: formData.status,
          notes: formData.notes
        };

        await axios.post('/job-orders', createPayload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        toast.success('Job order added successfully!');
        handleClear();
        setShowForm(false);
        fetchJobOrders();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Something went wrong';
      toast.error(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      linkedPo: job.linkedPo || '',
      taskDescription: job.taskDescription || '',
      assignedTo: job.assignedTo || '',
      startDate: job.startDate ? job.startDate.split('T')[0] : '',
      endDate: job.endDate ? job.endDate.split('T')[0] : '',
      status: job.status || 'Pending',
      notes: job.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job order?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(`/job-orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setJobOrders(prev => prev.filter(job => job.id !== id));
      toast.success('Job order deleted successfully!');
      fetchJobOrders();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete job order';
      toast.error(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      linkedPo: '',
      taskDescription: '',
      assignedTo: '',
      startDate: '',
      endDate: '',
      status: 'Pending',
      notes: ''
    });
    setEditingJob(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    handleClear();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#f59e0b'; // amber
      case 'In Progress': return '#3b82f6'; // blue
      case 'Completed': return '#10b981'; // green
      default: return '#9ca3af'; // gray
    }
  };

  const generateNextJobId = () => {
    if (!Array.isArray(jobOrders) || jobOrders.length === 0) {
      return 'JOB-001';
    }
    
    const maxId = Math.max(...jobOrders.map(job => {
      const idField = job.jobId || job.jobordid || job.id;
      if (!idField) return 0;
      const idParts = idField.split('-');
      return idParts && idParts[1] ? parseInt(idParts[1]) || 0 : 0;
    }));
    
    return `JOB-${String(maxId + 1).padStart(3, '0')}`;
  };

  // Filter job orders based on search term
  const filteredJobOrders = Array.isArray(jobOrders) ? jobOrders.filter(job =>
    job.jobId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.linkedPo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.taskDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.id?.toString() ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="enquiries-container">
      <style jsx>{`
        .job-cards {
          display: none;
        }

        .job-card {
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

        .card-linked-id {
          font-size: 12px;
          color: #6b7280;
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

        .card-status {
          text-align: center;
          background: #f9fafb;
          padding: 6px 12px;
          border-radius: 6px;
        }

        .card-status .card-value {
          font-weight: 600;
        }

        .card-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          padding-top: 8px;
          border-top: 1px solid #f3f4f6;
        }

        .card-dates {
          display: flex;
          gap: 8px;
        }

        .card-date {
          flex: 1;
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

          .job-cards {
            display: block;
            padding: 0 16px 32px;
          }

          .job-card:last-child {
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

          .card-actions {
            justify-content: center;
          }

          .card-dates {
            flex-direction: column;
            gap: 0;
          }
        }
      `}</style>

 

      <div className="page-header">
        <div className="header-actions">
          <div className="action-buttons">
            <button className="add-btn" onClick={() => setShowForm(true)}>
              <Plus size={20} />
              <span>Add Job Order</span>
            </button>
            <button 
              className="export-btn" 
              onClick={() => {
                const dataStr = JSON.stringify(filteredJobOrders, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                const exportFileDefaultName = 'job-orders-export.json';
                
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
              placeholder="Search job orders..."
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
        
        .add-btn, .export-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        
        .add-btn {
          background-color: #3b82f6;
          color: white;
          border: 1px solid #3b82f6;
        }
        
        .add-btn:hover {
          background-color: #2563eb;
          border-color: #2563eb;
        }
        
        .export-btn {
          background-color: #f3f4f6;
          color: #374151;
          border: 1px solid #e5e7eb;
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
          <h3 className="table-title">Job Orders</h3>
        </div>

        {/* Desktop Table View */}
        <div className="table-wrapper">
          <table className="enquiries-table">
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Linked PO</th>
                <th>Task</th>
                <th>Assigned To</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobOrders.map((job) => (
                <tr key={job.id || job._id}>
                  <td>{job.jobId}</td>
                  <td>{job.linkedPo}</td>
                  <td>{job.taskDescription}</td>
                  <td>{job.assignedTo}</td>
                  <td>{job.startDate ? job.startDate.split('T')[0] : ''}</td>
                  <td>{job.endDate ? job.endDate.split('T')[0] : ''}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(job.status) }}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="actions">
                    <button 
                      className="edit-btn" 
                      title="Edit"
                      onClick={() => handleEdit(job)}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(job.id || job._id)}
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
        <div className="job-cards">
          {filteredJobOrders.map((job) => (
            <div key={job.id || job._id} className="job-card">
              <div className="card-header">
                <div>
                  <div className="card-id">{job.jobId}</div>
                  <div className="card-linked-id">Linked to: {job.linkedPo}</div>
                </div>
                <div className="card-actions">
                  <button 
                    className="edit-btn" 
                    title="Edit"
                    onClick={() => handleEdit(job)}
                  >
                    <Edit size={14} />
                  </button>
                  <button 
                    className="delete-btn" 
                    onClick={() => handleDelete(job.id || job._id)} 
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="card-content">
                <div className="card-field">
                  <div className="card-label">Task</div>
                  <div className="card-value">{job.taskDescription}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Assigned To</div>
                  <div className="card-value">{job.assignedTo}</div>
                </div>
              </div>

              <div className="card-dates">
                <div className="card-field card-date">
                  <div className="card-label">Start Date</div>
                  <div className="card-value">{job.startDate ? job.startDate.split('T')[0] : ''}</div>
                </div>
                <div className="card-field card-date">
                  <div className="card-label">End Date</div>
                  <div className="card-value">{job.endDate ? job.endDate.split('T')[0] : ''}</div>
                </div>
              </div>

              <div className="card-status">
                <div className="card-label">Status</div>
                <div className="card-value" style={{ color: getStatusColor(job.status) }}>
                  {job.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <>
          <div className="modal-overlay" onClick={handleCloseForm}></div>
          <div className="form-modal">
            <div className="form-header">
              <h3 className="form-title">
                {editingJob ? 'Edit Job Order' : 'Add Job Order'}
              </h3>
              <button className="close-btn" onClick={handleCloseForm}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="enquiry-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Job Order ID {editingJob ? '' : '(Auto)'}</label>
                  <input
                    type="text"
                    value={editingJob ? (editingJob.jobId || editingJob.jobordid) : generateNextJobId()}
                    readOnly
                    className="readonly-input"
                  />
                </div>
                <div className="form-group">
                  <label>Linked PO / Quotation *</label>
                  <input
                    type="text"
                    name="linkedPo"
                    value={formData.linkedPo}
                    onChange={handleInputChange}
                    placeholder="Enter PO or Quotation ID"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Task Description *</label>
                <textarea
                  name="taskDescription"
                  value={formData.taskDescription}
                  onChange={handleInputChange}
                  placeholder="Describe the job task"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Assigned To *</label>
                  <input
                    type="text"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleInputChange}
                    placeholder="Employee name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any special instructions or notes"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="clear-btn" onClick={handleClear}>
                  <RotateCcw size={16} />
                  <span>Clear</span>
                </button>
                <button type="submit" className="save-btn" disabled={loading}>
                  <Save size={16} />
                  <span>{loading ? 'Saving...' : (editingJob ? 'Update Job' : 'Save Job')}</span>
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Job;