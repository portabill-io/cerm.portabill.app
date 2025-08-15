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

const Quotations = () => {
  const [showForm, setShowForm] = useState(false);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [formData, setFormData] = useState({
    enquiry_id: '',
    client_name: '',
    service_description: '',
    quantity: 1,
    unit_price: 0,
    tax: 0,
    validity_date: '',
    status: 'Draft'
  });

  // Fetch quotations from the backend on mount
  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/quotations', {
        headers: { Authorization: `Bearer ${token}` }
      });

      let data = response.data;
      let quotationsArr = [];
      if (Array.isArray(data)) {
        quotationsArr = data;
      } else if (data && Array.isArray(data.quotations)) {
        quotationsArr = data.quotations;
      } else if (data && Array.isArray(data.data)) {
        quotationsArr = data.data;
      }

      // Transform backend fields to frontend fields
      const mappedQuotations = quotationsArr.map((q, idx) => ({
        ...q,
        quotation_id: q.quotation_id || q.id || `QUO-${String(idx + 1).padStart(3, '0')}`,
        enquiry_id: q.enquiry_id ?? '',
        client_name: q.client_name ?? '',
        service_description: q.service_description ?? q.description ?? '',
        quantity: q.quantity ?? 1,
        unit_price: q.unit_price ?? 0,
        tax: q.tax ?? 0,
        validity_date: q.validity_date ?? '',
        status: q.status ?? 'Draft',
        date: q.date || (q.createdAt ? new Date(q.createdAt).toISOString().split('T')[0] : ''),
        total: (q.quantity ?? 1) * (q.unit_price ?? 0) + (q.tax ?? 0)
      }));

      setQuotations(mappedQuotations);
    } catch (error) {
      toast.error('Error fetching quotations');
      setQuotations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: ['quantity', 'unit_price', 'tax'].includes(name)
          ? parseFloat(value) || 0
          : value
      };
      updated.total = updated.quantity * updated.unit_price + updated.tax;
      return updated;
    });
  };

  const handleEdit = (quotation) => {
    setEditingQuotation(quotation);
    setFormData({
      enquiry_id: quotation.enquiry_id,
      client_name: quotation.client_name,
      service_description: quotation.service_description,
      quantity: quotation.quantity,
      unit_price: quotation.unit_price,
      tax: quotation.tax,
      validity_date: quotation.validity_date,
      status: quotation.status
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingQuotation(null);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      date: new Date().toISOString().split('T')[0],
      enquiry_id: formData.enquiry_id,
      client_name: formData.client_name,
      service_description: formData.service_description,
      quantity: formData.quantity,
      unit_price: formData.unit_price,
      tax: formData.tax,
      validity_date: formData.validity_date,
      status: formData.status
    };

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (editingQuotation) {
        // Update existing quotation
        await axios.put(`/quotations/${editingQuotation.quotation_id}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        toast.success('Quotation updated successfully!');
      } else {
        // Create new quotation
        await axios.post('/quotations', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        toast.success('Quotation added successfully!');
      }
      setShowForm(false);
      resetForm();
      setEditingQuotation(null);
      fetchQuotations();
    } catch (error) {
      toast.error('Failed to save quotation');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      enquiry_id: '',
      client_name: '',
      service_description: '',
      quantity: 1,
      unit_price: 0,
      tax: 0,
      validity_date: '',
      status: 'Draft'
    });
  };

  const handleDelete = async (quotation_id) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        await axios.delete(`/quotations/${quotation_id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        toast.success('Quotation deleted');
        fetchQuotations();
      } catch (error) {
        toast.error('Failed to delete quotation');
      } finally {
        setLoading(false);
      }
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

  const filteredQuotations = Array.isArray(quotations)
    ? quotations.filter(q =>
        String(q.client_name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(q.enquiry_id ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(q.service_description ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(q.status ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(q.quotation_id ?? '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

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
            <button className="add-btn" onClick={() => {setShowForm(true); setEditingQuotation(null); resetForm();}}>
              <Plus size={20} />
              <span>Add New Quotation</span>
            </button>
            <button 
              className="export-btn" 
              onClick={() => {
                const dataStr = JSON.stringify(filteredQuotations, null, 2);
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
              {filteredQuotations.map((q) => (
                <tr key={q.quotation_id}>
                  <td>{q.quotation_id}</td>
                  <td>{q.date}</td>
                  <td>{q.enquiry_id}</td>
                  <td>{q.client_name}</td>
                  <td>₹{((q.quantity ?? 1) * (q.unit_price ?? 0) + (q.tax ?? 0)).toLocaleString()}</td>
                  <td>{q.validity_date}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(q.status) }}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="edit-btn" title="Edit" onClick={() => handleEdit(q)}>
                      <Edit size={16} />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(q.quotation_id)}
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
          {filteredQuotations.map((q) => (
            <div key={q.quotation_id} className="quotation-card">
              <div className="card-header">
                <div>
                  <div className="card-id">{q.quotation_id}</div>
                  <div className="card-date">{q.date}</div>
                </div>
                <div className="card-actions">
                  <button className="edit-btn" title="Edit" onClick={() => handleEdit(q)}>
                    <Edit size={14} />
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(q.quotation_id)} title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="card-content">
                <div className="card-field">
                  <div className="card-label">Enquiry ID</div>
                  <div className="card-value">{q.enquiry_id}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Client</div>
                  <div className="card-value">{q.client_name}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Description</div>
                  <div className="card-value">{q.service_description}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Validity</div>
                  <div className="card-value">{q.validity_date}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Total</div>
                  <div className="card-value card-total">₹{((q.quantity ?? 1) * (q.unit_price ?? 0) + (q.tax ?? 0)).toLocaleString()}</div>
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
          <div className="modal-overlay" onClick={handleCloseForm}></div>
          <div className="form-modal">
            <div className="form-header">
              <h3 className="form-title">
                {editingQuotation ? 'Edit Quotation' : 'Add New Quotation'}
              </h3>
              <button className="close-btn" onClick={handleCloseForm}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="enquiry-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Quotation ID (Auto)</label>
                  <input
                    type="text"
                    value={editingQuotation ? editingQuotation.quotation_id : `QUO-${String(quotations.length + 1).padStart(3, '0')}`}
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
                    name="enquiry_id"
                    value={formData.enquiry_id}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter enquiry ID"
                  />
                </div>
                <div className="form-group">
                  <label>Client Name</label>
                  <input
                    type="text"
                    name="client_name"
                    value={formData.client_name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter client name"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Service/Product Description</label>
                <textarea
                  name="service_description"
                  value={formData.service_description}
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
                    name="unit_price"
                    value={formData.unit_price}
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
                    value={formData.quantity * formData.unit_price + formData.tax}
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
                    name="validity_date"
                    value={formData.validity_date}
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
                <button type="submit" className="save-btn" disabled={loading}>
                  <Save size={16} />
                  <span>{loading ? 'Saving...' : (editingQuotation ? 'Update Quotation' : 'Save Quotation')}</span>
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