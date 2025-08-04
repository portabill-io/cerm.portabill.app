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

const Quotations = () => {
  const [showForm, setShowForm] = useState(false);
  const [quotations, setQuotations] = useState([
    {
      id: 'QUO-001',
      date: '2025-07-30',
      enquiryId: 'ENQ-001',
      clientName: 'ABC Corp',
      description: 'Website development service',
      quantity: 1,
      unitPrice: 50000,
      tax: 9000,
      total: 59000,
      validity: '2025-08-15',
      status: 'Sent'
    },
    {
      id: 'QUO-002',
      date: '2025-07-31',
      enquiryId: 'ENQ-002',
      clientName: 'XYZ Ltd',
      description: 'Mobile app development',
      quantity: 1,
      unitPrice: 75000,
      tax: 13500,
      total: 88500,
      validity: '2025-08-20',
      status: 'Draft'
    },
    {
      id: 'QUO-003',
      date: '2025-08-01',
      enquiryId: 'ENQ-003',
      clientName: 'Tech Solutions Inc',
      description: 'E-commerce platform',
      quantity: 1,
      unitPrice: 120000,
      tax: 21600,
      total: 141600,
      validity: '2025-08-25',
      status: 'Approved'
    }
  ]);

  const [formData, setFormData] = useState({
    enquiryId: '',
    clientName: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    tax: 0,
    total: 0,
    validity: '',
    status: 'Draft'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: name === 'quantity' || name === 'unitPrice' || name === 'tax'
          ? parseFloat(value) || 0
          : value
      };
      updated.total = updated.quantity * updated.unitPrice + updated.tax;
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newQuotation = {
      id: `QUO-${String(quotations.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      ...formData
    };
    setQuotations((prev) => [...prev, newQuotation]);
    resetForm();
    setShowForm(false);
  };

  const resetForm = () => {
    setFormData({
      enquiryId: '',
      clientName: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      tax: 0,
      total: 0,
      validity: '',
      status: 'Draft'
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      setQuotations((prev) => prev.filter((q) => q.id !== id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return '#6b7280';
      case 'Sent': return '#3b82f6';
      case 'Approved': return '#10b981';
      case 'Rejected': return '#ef4444';
      default: return '#9ca3af';
    }
  };

  return (
    <div className="enquiries-container">
      <style jsx>{`
        .quotation-cards {
          display: none;
        }

        .quotation-card {
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

        .card-total {
          font-weight: 600;
          color: #111827;
        }

        @media (max-width: 768px) {
          .table-wrapper {
            display: none;
          }

          .quotation-cards {
            display: block;
            padding: 0 16px 32px;
          }
.quotation-card:last-child {
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
        <span>Add New Quotation</span>
      </button>
      <button 
        className="export-btn" 
        onClick={() => {
          const dataStr = JSON.stringify(quotations, null, 2);
          const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
          const exportFileDefaultName = 'quotations-export.json';
          
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
        placeholder="Search quotations..."
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
          <h3 className="table-title">Existing Quotations</h3>
        </div>

        {/* Desktop Table View */}
        <div className="table-wrapper">
          <table className="enquiries-table">
            <thead>
              <tr>
                <th>Quotation ID</th>
                <th>Date</th>
                <th>Enquiry ID</th>
                <th>Client Name</th>
                <th>Total</th>
                <th>Validity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((q) => (
                <tr key={q.id}>
                  <td>{q.id}</td>
                  <td>{q.date}</td>
                  <td>{q.enquiryId}</td>
                  <td>{q.clientName}</td>
                  <td>₹{q.total.toLocaleString()}</td>
                  <td>{q.validity}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(q.status) }}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="edit-btn" title="Edit">
                      <Edit size={16} />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(q.id)}
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
        <div className="quotation-cards">
          {quotations.map((q) => (
            <div key={q.id} className="quotation-card">
              <div className="card-header">
                <div>
                  <div className="card-id">{q.id}</div>
                  <div className="card-date">{q.date}</div>
                </div>
                <div className="card-actions">
                  <button className="edit-btn" title="Edit">
                    <Edit size={14} />
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(q.id)} title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="card-content">
                <div className="card-field">
                  <div className="card-label">Enquiry ID</div>
                  <div className="card-value">{q.enquiryId}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Client</div>
                  <div className="card-value">{q.clientName}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Description</div>
                  <div className="card-value">{q.description}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Validity</div>
                  <div className="card-value">{q.validity}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Total</div>
                  <div className="card-value card-total">₹{q.total.toLocaleString()}</div>
                </div>
              </div>

              <div className="card-status">
                <div className="card-label">Status</div>
                <div className="card-value" style={{ color: getStatusColor(q.status) }}>
                  {q.status}
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
              <h3 className="form-title">Add New Quotation</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="enquiry-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Quotation ID (Auto)</label>
                  <input
                    type="text"
                    value={`QUO-${String(quotations.length + 1).padStart(3, '0')}`}
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

              <div className="form-row">
                <div className="form-group">
                  <label>Linked Enquiry ID</label>
                  <input
                    type="text"
                    name="enquiryId"
                    value={formData.enquiryId}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter enquiry ID"
                  />
                </div>
                <div className="form-group">
                  <label>Client Name</label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter client name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Service/Product Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the service or product"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Unit Price (₹)</label>
                  <input
                    type="number"
                    name="unitPrice"
                    value={formData.unitPrice}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tax (₹)</label>
                  <input
                    type="number"
                    name="tax"
                    value={formData.tax}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Total (Auto)</label>
                  <input
                    type="number"
                    value={formData.total}
                    readOnly
                    className="readonly-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Validity Date</label>
                  <input
                    type="date"
                    name="validity"
                    value={formData.validity}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="clear-btn" onClick={resetForm}>
                  <RotateCcw size={16} />
                  <span>Clear</span>
                </button>
                <button type="submit" className="save-btn">
                  <Save size={16} />
                  <span>Save Quotation</span>
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Quotations;