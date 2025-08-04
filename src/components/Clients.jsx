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

const Clients = () => {
  const [showForm, setShowForm] = useState(false);
  const [clients, setClients] = useState([
    {
      id: 'CLT-001',
      company: 'ABC Pvt Ltd',
      contactPerson: 'John Doe',
      email: 'john@abc.com',
      phone: '9876543210',
      gstin: '29ABCDE1234F1Z5',
      address: '123 MG Road, Bangalore',
      status: 'Active'
    },
    {
      id: 'CLT-002',
      company: 'XYZ Solutions',
      contactPerson: 'Priya Sharma',
      email: 'priya@xyz.com',
      phone: '8765432109',
      gstin: '27XYZAB5678G2H3',
      address: '456 Brigade Road, Mumbai',
      status: 'Active'
    },
    {
      id: 'CLT-003',
      company: 'Tech Innovators',
      contactPerson: 'Rahul Patel',
      email: 'rahul@tech.com',
      phone: '7654321098',
      gstin: '24TECHI8765J4K5',
      address: '789 IT Park, Hyderabad',
      status: 'Inactive'
    }
  ]);

  const [formData, setFormData] = useState({
    company: '',
    contactPerson: '',
    email: '',
    phone: '',
    gstin: '',
    address: '',
    status: 'Active'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newClient = {
      id: `CLT-${String(clients.length + 1).padStart(3, '0')}`,
      ...formData
    };
    setClients(prev => [...prev, newClient]);
    resetForm();
    setShowForm(false);
  };

  const resetForm = () => {
    setFormData({
      company: '',
      contactPerson: '',
      email: '',
      phone: '',
      gstin: '',
      address: '',
      status: 'Active'
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this client?')) {
      setClients(prev => prev.filter(c => c.id !== id));
    }
  };

  const getStatusColor = (status) => {
    return status === 'Active' ? '#10b981' : '#ef4444';
  };

  return (
    <div className="enquiries-container">
      <style jsx>{`
        .client-cards {
          display: none;
        }

        .client-card {
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

        .card-company {
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

          .client-cards {
            display: block;
          padding: 0 16px 32px;
          }
.client-card:last-child {
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
        <span>Add Client</span>
      </button>
      <button 
        className="export-btn" 
        onClick={() => {
          const dataStr = JSON.stringify(clients, null, 2);
          const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
          const exportFileDefaultName = 'clients-export.json';
          
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
        placeholder="Search clients..."
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
          <h3 className="table-title">Client List</h3>
        </div>

        {/* Desktop Table View */}
        <div className="table-wrapper">
          <table className="enquiries-table">
            <thead>
              <tr>
                <th>Client ID</th>
                <th>Company</th>
                <th>Contact Person</th>
                <th>Email / Phone</th>
                <th>GSTIN / PAN</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id}>
                  <td>{client.id}</td>
                  <td>{client.company}</td>
                  <td>{client.contactPerson}</td>
                  <td>{client.email}<br/>{client.phone}</td>
                  <td>{client.gstin}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(client.status) }}
                    >
                      {client.status}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="edit-btn" title="Edit">
                      <Edit size={16} />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(client.id)}
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
        <div className="client-cards">
          {clients.map(client => (
            <div key={client.id} className="client-card">
              <div className="card-header">
                <div>
                  <div className="card-id">{client.id}</div>
                  <div className="card-company">{client.company}</div>
                </div>
                <div className="card-actions">
                  <button className="edit-btn" title="Edit">
                    <Edit size={14} />
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(client.id)} title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="card-content">
                <div className="card-field">
                  <div className="card-label">Contact Person</div>
                  <div className="card-value">{client.contactPerson}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Email</div>
                  <div className="card-value">{client.email}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Phone</div>
                  <div className="card-value">{client.phone}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">GSTIN/PAN</div>
                  <div className="card-value">{client.gstin}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Address</div>
                  <div className="card-value">{client.address}</div>
                </div>
              </div>

              <div className="card-status">
                <div className="card-label">Status</div>
                <div className="card-value" style={{ color: getStatusColor(client.status) }}>
                  {client.status}
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
              <h3 className="form-title">Add Client</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="enquiry-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Client ID (Auto)</label>
                  <input
                    type="text"
                    readOnly
                    className="readonly-input"
                    value={`CLT-${String(clients.length + 1).padStart(3, '0')}`}
                  />
                </div>
                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contact Person</label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>GSTIN / PAN</label>
                  <input
                    type="text"
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="clear-btn" onClick={resetForm}>
                  <RotateCcw size={16} />
                  <span>Clear</span>
                </button>
                <button type="submit" className="save-btn">
                  <Save size={16} />
                  <span>Save Client</span>
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Clients;