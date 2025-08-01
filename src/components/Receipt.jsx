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

const Receipt = () => {
  const [showForm, setShowForm] = useState(false);
  const [receipts, setReceipts] = useState([
    {
      id: 'RCPT-001',
      date: '2025-07-31',
      invoiceId: 'INV-001',
      paymentMode: 'UPI',
      amount: 20000,
      referenceNo: 'UTR9845632',
      remarks: 'Advance payment'
    },
    {
      id: 'RCPT-002',
      date: '2025-08-05',
      invoiceId: 'INV-002',
      paymentMode: 'Bank',
      amount: 29500,
      referenceNo: 'NEFT456789',
      remarks: 'Full payment'
    },
    {
      id: 'RCPT-003',
      date: '2025-08-10',
      invoiceId: 'INV-003',
      paymentMode: 'Cheque',
      amount: 15000,
      referenceNo: 'CHQ789456',
      remarks: 'Partial payment'
    }
  ]);

  const [formData, setFormData] = useState({
    invoiceId: '',
    paymentMode: 'Bank',
    amount: '',
    referenceNo: '',
    remarks: ''
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
    const newReceipt = {
      id: `RCPT-${String(receipts.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      ...formData,
      amount: parseFloat(formData.amount)
    };
    setReceipts(prev => [...prev, newReceipt]);
    resetForm();
    setShowForm(false);
  };

  const resetForm = () => {
    setFormData({
      invoiceId: '',
      paymentMode: 'Bank',
      amount: '',
      referenceNo: '',
      remarks: ''
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this receipt?')) {
      setReceipts(prev => prev.filter(r => r.id !== id));
    }
  };

  const getPaymentModeColor = (mode) => {
    switch (mode) {
      case 'Bank': return '#3b82f6'; // blue
      case 'UPI': return '#8b5cf6'; // violet
      case 'Cash': return '#10b981'; // green
      case 'Cheque': return '#f59e0b'; // amber
      default: return '#9ca3af'; // gray
    }
  };

  return (
    <div className="enquiries-container">
      <style jsx>{`
        .receipt-cards {
          display: none;
        }

        .receipt-card {
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

        .card-payment-mode {
          text-align: center;
          background: #f9fafb;
          padding: 6px 12px;
          border-radius: 6px;
        }

        .card-payment-mode .card-value {
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

          .receipt-cards {
            display: block;
            padding: 0 16px 16px;
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
        <span>Add Receipt</span>
      </button>
      <button 
        className="export-btn" 
        onClick={() => {
          const dataStr = JSON.stringify(receipts, null, 2);
          const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
          const exportFileDefaultName = 'receipts-export.json';
          
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
        placeholder="Search receipts..."
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
          <h3 className="table-title">Receipts</h3>
        </div>

        {/* Desktop Table View */}
        <div className="table-wrapper">
          <table className="enquiries-table">
            <thead>
              <tr>
                <th>Receipt ID</th>
                <th>Date</th>
                <th>Invoice ID</th>
                <th>Mode</th>
                <th>Amount</th>
                <th>Reference No.</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map(r => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.date}</td>
                  <td>{r.invoiceId}</td>
                  <td>
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getPaymentModeColor(r.paymentMode) }}
                    >
                      {r.paymentMode}
                    </span>
                  </td>
                  <td>₹{r.amount.toLocaleString()}</td>
                  <td>{r.referenceNo || '-'}</td>
                  <td>{r.remarks || '-'}</td>
                  <td className="actions">
                    <button className="edit-btn" title="Edit">
                      <Edit size={16} />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(r.id)}
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
        <div className="receipt-cards">
          {receipts.map(r => (
            <div key={r.id} className="receipt-card">
              <div className="card-header">
                <div>
                  <div className="card-id">{r.id}</div>
                  <div className="card-date">{r.date}</div>
                </div>
                <div className="card-actions">
                  <button className="edit-btn" title="Edit">
                    <Edit size={14} />
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(r.id)} title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="card-content">
                <div className="card-field">
                  <div className="card-label">Invoice ID</div>
                  <div className="card-value">{r.invoiceId}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Amount</div>
                  <div className="card-value card-amount">₹{r.amount.toLocaleString()}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Reference No.</div>
                  <div className="card-value">{r.referenceNo || '-'}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Remarks</div>
                  <div className="card-value">{r.remarks || '-'}</div>
                </div>
              </div>

              <div className="card-payment-mode">
                <div className="card-label">Payment Mode</div>
                <div className="card-value" style={{ color: getPaymentModeColor(r.paymentMode) }}>
                  {r.paymentMode}
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
              <h3 className="form-title">Add Receipt</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="enquiry-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Receipt ID (Auto)</label>
                  <input
                    type="text"
                    readOnly
                    className="readonly-input"
                    value={`RCPT-${String(receipts.length + 1).padStart(3, '0')}`}
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
                <label>Linked Invoice ID</label>
                <input
                  type="text"
                  name="invoiceId"
                  value={formData.invoiceId}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Payment Mode</label>
                <select
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleChange}
                >
                  <option value="Bank">Bank</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div className="form-group">
                <label>Amount Received (₹)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Reference No. (e.g., UTR, Cheque No.)</label>
                <input
                  type="text"
                  name="referenceNo"
                  value={formData.referenceNo}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Remarks</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder="Optional notes or remarks"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="clear-btn" onClick={resetForm}>
                  <RotateCcw size={16} />
                  <span>Clear</span>
                </button>
                <button type="submit" className="save-btn">
                  <Save size={16} />
                  <span>Save Receipt</span>
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Receipt;