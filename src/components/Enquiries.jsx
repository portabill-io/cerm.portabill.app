import React, { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X,
  Save,
  RotateCcw
} from 'lucide-react';
import './component.css';

const Enquiries = () => {
  const [showForm, setShowForm] = useState(false);
  const [enquiries, setEnquiries] = useState([
    {
      id: 'ENQ-001',
      date: '2025-07-28',
      clientName: 'ABC Corp',
      contactPerson: 'John Smith',
      email: 'john@abccorp.com',
      status: 'Converted',
      details: 'Website development project',
      followupDate: '2025-08-05',
      followupNotes: 'Client confirmed project requirements'
    },
    {
      id: 'ENQ-002',
      date: '2025-07-29',
      clientName: 'XYZ Ltd',
      contactPerson: 'Sarah Johnson',
      email: 'sarah@xyzltd.com',
      status: 'Responded',
      details: 'Mobile app development inquiry',
      followupDate: '2025-08-02',
      followupNotes: 'Waiting for budget approval'
    },
    {
      id: 'ENQ-003',
      date: '2025-07-30',
      clientName: 'Tech Solutions Inc',
      contactPerson: 'Mike Davis',
      email: 'mike@techsolutions.com',
      status: 'New',
      details: 'E-commerce platform development',
      followupDate: '2025-08-01',
      followupNotes: 'Initial contact made'
    }
  ]);

  const [formData, setFormData] = useState({
    clientName: '',
    contactPerson: '',
    email: '',
    details: '',
    status: 'New',
    followupDate: '',
    followupNotes: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEnquiry = {
      id: `ENQ-${String(enquiries.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      ...formData
    };
    setEnquiries(prev => [...prev, newEnquiry]);
    handleClear();
    setShowForm(false);
  };

  const handleClear = () => {
    setFormData({
      clientName: '',
      contactPerson: '',
      email: '',
      details: '',
      status: 'New',
      followupDate: '',
      followupNotes: ''
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this enquiry?')) {
      setEnquiries(prev => prev.filter(enquiry => enquiry.id !== id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return '#3b82f6';
      case 'Responded': return '#f59e0b';
      case 'Converted': return '#10b981';
      case 'Dropped': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="enquiries-container">
      <style jsx>{`
        .enquiry-cards {
          display: none;
        }

        .enquiry-card {
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

        .card-date {
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

        @media (max-width: 768px) {
          .table-wrapper {
            display: none;
          }

        .enquiry-cards {
  display: block;
  padding: 0 16px 32px;
}
.enquiry-card:last-child {
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
        }
      `}</style>

 <div className="page-header">
  <div className="header-actions">
    <div className="action-buttons">
      <button className="add-btn" onClick={() => setShowForm(true)}>
        <Plus size={20} />
        <span>Add New Enquiry</span>
      </button>
      <button 
        className="export-btn" 
        onClick={() => {
          const dataStr = JSON.stringify(enquiries, null, 2);
          const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
          const exportFileDefaultName = 'enquiries-export.json';
          
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
        placeholder="Search enquiries..."
        className="search-input"
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
  }
  
  .action-buttons {
    display: flex;
    gap: 12px;
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
  }

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
  }

  .search-input {
    width: 100%;
    padding: 8px 12px 8px 36px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    font-size: 14px;
    transition: all 0.2s ease;
  }

  .search-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }

  @media (min-width: 640px) {
    .header-actions {
      flex-direction: row;
      align-items: center;
    }
    
    .search-container {
      width: auto;
      min-width: 200px;
      max-width: 300px;
    }
  }
`}</style>

      <div className="table-container">
        <div className="table-header">
          <h3 className="table-title">Existing Enquiries</h3>
        </div>

        {/* Desktop Table View */}
        <div className="table-wrapper">
          <table className="enquiries-table">
            <thead>
              <tr>
                <th>Enquiry ID</th>
                <th>Date</th>
                <th>Client Name</th>
                <th>Contact Person</th>
                <th>Email/Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((enquiry) => (
                <tr key={enquiry.id}>
                  <td>{enquiry.id}</td>
                  <td>{enquiry.date}</td>
                  <td>{enquiry.clientName}</td>
                  <td>{enquiry.contactPerson}</td>
                  <td>{enquiry.email}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(enquiry.status) }}
                    >
                      {enquiry.status}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="edit-btn" title="Edit">
                      <Edit size={16} />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(enquiry.id)}
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
        <div className="enquiry-cards">
          {enquiries.map((enquiry) => (
            <div key={enquiry.id} className="enquiry-card">
              <div className="card-header">
                <div>
                  <div className="card-id">{enquiry.id}</div>
                  <div className="card-date">{enquiry.date}</div>
                </div>
                <div className="card-actions">
                  <button className="edit-btn" title="Edit">
                    <Edit size={14} />
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(enquiry.id)} title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="card-content">
                <div className="card-field">
                  <div className="card-label">Client</div>
                  <div className="card-value">{enquiry.clientName}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Contact</div>
                  <div className="card-value">{enquiry.contactPerson}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Email/Phone</div>
                  <div className="card-value">{enquiry.email}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Details</div>
                  <div className="card-value">{enquiry.details}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Follow-up</div>
                  <div className="card-value">{enquiry.followupDate}</div>
                </div>
              </div>

              <div className="card-status">
                <div className="card-label">Status</div>
                <div className="card-value" style={{ color: getStatusColor(enquiry.status) }}>
                  {enquiry.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <>
          <div className="modal-overlay" onClick={() => setShowForm(false)}></div>
          <div className="form-modal">
            <div className="form-header">
              <h3 className="form-title">Add New Enquiry</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="enquiry-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Enquiry ID (Auto)</label>
                  <input
                    type="text"
                    value={`ENQ-${String(enquiries.length + 1).padStart(3, '0')}`}
                    readOnly
                    className="readonly-input"
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={new Date().toISOString().split('T')[0]}
                    readOnly
                    className="readonly-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Client Name</label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  placeholder="Enter client name"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contact Person</label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    placeholder="Enter contact person"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email / Phone</label>
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email or phone"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Enquiry Details</label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleInputChange}
                  placeholder="Describe the enquiry"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="New">New</option>
                    <option value="Responded">Responded</option>
                    <option value="Converted">Converted</option>
                    <option value="Dropped">Dropped</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Follow-up Date</label>
                  <input
                    type="date"
                    name="followupDate"
                    value={formData.followupDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Follow-up Notes</label>
                <textarea
                  name="followupNotes"
                  value={formData.followupNotes}
                  onChange={handleInputChange}
                  placeholder="Add follow-up notes"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="clear-btn" onClick={handleClear}>
                  <RotateCcw size={16} />
                  <span>Clear</span>
                </button>
                <button type="submit" className="save-btn">
                  <Save size={16} />
                  <span>Save Enquiry</span>
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Enquiries;