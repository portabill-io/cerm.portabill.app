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

const Invoice = () => {
  const [showForm, setShowForm] = useState(false);
  const [invoices, setInvoices] = useState([
    {
      id: 'INV-001',
      date: '2025-07-31',
      linkedTo: 'JOB-001',
      invoiceType: 'Final',
      description: 'Final invoice for e-commerce project',
      amount: 50000,
      tax: 9000,
      total: 59000,
      status: 'Unpaid'
    },
    {
      id: 'INV-002',
      date: '2025-08-05',
      linkedTo: 'JOB-002',
      invoiceType: 'Advance',
      description: '50% advance payment for mobile app',
      amount: 25000,
      tax: 4500,
      total: 29500,
      status: 'Paid'
    },
    {
      id: 'INV-003',
      date: '2025-08-10',
      linkedTo: 'JOB-003',
      invoiceType: 'Milestone',
      description: 'Phase 1 completion payment',
      amount: 30000,
      tax: 5400,
      total: 35400,
      status: 'Partially Paid'
    }
  ]);

  const [formData, setFormData] = useState({
    linkedTo: '',
    invoiceType: 'Final',
    description: '',
    amount: '',
    tax: '',
    total: '',
    status: 'Unpaid'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Auto calculate total if amount or tax changes
    const updated = {
      ...formData,
      [name]: value
    };
    if (name === 'amount' || name === 'tax') {
      const amount = parseFloat(updated.amount || 0);
      const tax = parseFloat(updated.tax || 0);
      updated.total = (amount + tax).toFixed(2);
    }

    setFormData(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newInvoice = {
      id: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      ...formData,
      amount: parseFloat(formData.amount),
      tax: parseFloat(formData.tax),
      total: parseFloat(formData.total)
    };
    setInvoices(prev => [...prev, newInvoice]);
    resetForm();
    setShowForm(false);
  };

  const resetForm = () => {
    setFormData({
      linkedTo: '',
      invoiceType: 'Final',
      description: '',
      amount: '',
      tax: '',
      total: '',
      status: 'Unpaid'
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this invoice?')) {
      setInvoices(prev => prev.filter(inv => inv.id !== id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Unpaid': return '#ef4444'; // red
      case 'Partially Paid': return '#f59e0b'; // amber
      case 'Paid': return '#10b981'; // green
      default: return '#9ca3af'; // gray
    }
  };

  return (
    <div className="enquiries-container">
      <style jsx>{`
        .invoice-cards {
          display: none;
        }

        .invoice-card {
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

        .card-amount {
          font-weight: 600;
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

          .invoice-cards {
            display: block;
             padding: 0 16px 32px;
          }
.invoice-card:last-child {
  margin-bottom: 26px;
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
        <span>Add Invoice</span>
      </button>
      <button 
        className="export-btn" 
        onClick={() => {
          const dataStr = JSON.stringify(invoices, null, 2);
          const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
          const exportFileDefaultName = 'invoices-export.json';
          
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
        placeholder="Search invoices..."
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
          <h3 className="table-title">Invoices</h3>
        </div>

        {/* Desktop Table View */}
        <div className="table-wrapper">
          <table className="enquiries-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Date</th>
                <th>Linked To</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Tax</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td>{inv.id}</td>
                  <td>{inv.date}</td>
                  <td>{inv.linkedTo}</td>
                  <td>{inv.invoiceType}</td>
                  <td>₹{inv.amount.toLocaleString()}</td>
                  <td>₹{inv.tax.toLocaleString()}</td>
                  <td>₹{inv.total.toLocaleString()}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(inv.status) }}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="edit-btn" title="Edit">
                      <Edit size={16} />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(inv.id)}
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
        <div className="invoice-cards">
          {invoices.map(inv => (
            <div key={inv.id} className="invoice-card">
              <div className="card-header">
                <div>
                  <div className="card-id">{inv.id}</div>
                  <div className="card-date">{inv.date}</div>
                </div>
                <div className="card-actions">
                  <button className="edit-btn" title="Edit">
                    <Edit size={14} />
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(inv.id)} title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="card-content">
                <div className="card-field">
                  <div className="card-label">Linked To</div>
                  <div className="card-value">{inv.linkedTo}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Type</div>
                  <div className="card-value">{inv.invoiceType}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Amount</div>
                  <div className="card-value card-amount">₹{inv.amount.toLocaleString()}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Tax</div>
                  <div className="card-value">₹{inv.tax.toLocaleString()}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Total</div>
                  <div className="card-value card-amount">₹{inv.total.toLocaleString()}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Description</div>
                  <div className="card-value">{inv.description}</div>
                </div>
              </div>

              <div className="card-status">
                <div className="card-label">Status</div>
                <div className="card-value" style={{ color: getStatusColor(inv.status) }}>
                  {inv.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <>
          <div className="modal-overlay" onClick={() => setShowForm(false)}></div>
          <div className="form-modal">
            <div className="form-header">
              <h3 className="form-title">Add Invoice</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="enquiry-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Invoice ID (Auto)</label>
                  <input
                    type="text"
                    readOnly
                    className="readonly-input"
                    value={`INV-${String(invoices.length + 1).padStart(3, '0')}`}
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    readOnly
                    className="readonly-input"
                    value={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Linked Job Order / PO ID</label>
                <input
                  type="text"
                  name="linkedTo"
                  value={formData.linkedTo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Invoice Type</label>
                <select
                  name="invoiceType"
                  value={formData.invoiceType}
                  onChange={handleChange}
                >
                  <option value="Advance">Advance</option>
                  <option value="Final">Final</option>
                  <option value="Milestone">Milestone</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Work description or notes"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Amount (₹)</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tax (₹)</label>
                  <input
                    type="number"
                    name="tax"
                    value={formData.tax}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Total (₹)</label>
                <input
                  type="number"
                  name="total"
                  value={formData.total}
                  readOnly
                  className="readonly-input"
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="clear-btn" onClick={resetForm}>
                  <RotateCcw size={16} />
                  <span>Clear</span>
                </button>
                <button type="submit" className="save-btn">
                  <Save size={16} />
                  <span>Save Invoice</span>
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Invoice;