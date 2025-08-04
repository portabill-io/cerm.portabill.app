import React, { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  RotateCcw,
  Upload
} from 'lucide-react';
import './component.css';

const Purchase = () => {
  const [showForm, setShowForm] = useState(false);
  const [purchases, setPurchases] = useState([
    {
      id: 'PO-001',
      date: '2025-07-31',
      quotationId: 'QUO-001',
      clientPONumber: 'PO-ABC-9981',
      amountApproved: 59000,
      advanceReceived: 'Yes',
      poDocument: 'po-abc-9981.pdf',
      remarks: 'Payment to be cleared in 2 phases.'
    },
    {
      id: 'PO-002',
      date: '2025-08-01',
      quotationId: 'QUO-002',
      clientPONumber: 'PO-XYZ-4567',
      amountApproved: 88500,
      advanceReceived: 'No',
      poDocument: 'po-xyz-4567.pdf',
      remarks: 'Waiting for client confirmation'
    },
    {
      id: 'PO-003',
      date: '2025-08-02',
      quotationId: 'QUO-003',
      clientPONumber: 'PO-TECH-7890',
      amountApproved: 141600,
      advanceReceived: 'Yes',
      poDocument: 'po-tech-7890.pdf',
      remarks: '50% advance received'
    }
  ]);

  const [formData, setFormData] = useState({
    quotationId: '',
    clientPONumber: '',
    amountApproved: '',
    advanceReceived: 'No',
    poDocument: null,
    remarks: ''
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newPO = {
      id: `PO-${String(purchases.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      ...formData,
      poDocument: formData.poDocument?.name || 'N/A',
      amountApproved: parseFloat(formData.amountApproved) || 0
    };

    setPurchases((prev) => [...prev, newPO]);
    resetForm();
    setShowForm(false);
  };

  const resetForm = () => {
    setFormData({
      quotationId: '',
      clientPONumber: '',
      amountApproved: '',
      advanceReceived: 'No',
      poDocument: null,
      remarks: ''
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this PO?')) {
      setPurchases((prev) => prev.filter((po) => po.id !== id));
    }
  };

  return (
    <div className="enquiries-container">
      <style jsx>{`
        .purchase-cards {
          display: none;
        }

        .purchase-card {
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
          color: #111827;
        }

        .card-advance {
          text-align: center;
          background: #f9fafb;
          padding: 6px 12px;
          border-radius: 6px;
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

          .purchase-cards {
            display: block;
            padding: 0 16px 32px;
          }
.purchase-card:last-child {
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
        <span>Add Purchase Order</span>
      </button>
      <button 
        className="export-btn" 
        onClick={() => {
          const dataStr = JSON.stringify(purchaseOrders, null, 2);
          const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
          const exportFileDefaultName = 'purchase-orders-export.json';
          
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
        placeholder="Search purchase orders..."
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
          <h3 className="table-title">Logged Purchase Orders</h3>
        </div>

        {/* Desktop Table View */}
        <div className="table-wrapper">
          <table className="enquiries-table">
            <thead>
              <tr>
                <th>PO ID</th>
                <th>Date</th>
                <th>Quotation ID</th>
                <th>PO Number</th>
                <th>Amount</th>
                <th>Advance</th>
                <th>Document</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((po) => (
                <tr key={po.id}>
                  <td>{po.id}</td>
                  <td>{po.date}</td>
                  <td>{po.quotationId}</td>
                  <td>{po.clientPONumber}</td>
                  <td>₹{po.amountApproved.toLocaleString()}</td>
                  <td>{po.advanceReceived}</td>
                  <td>{po.poDocument}</td>
                  <td className="actions">
                    <button className="edit-btn" title="Edit">
                      <Edit size={16} />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(po.id)}
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
        <div className="purchase-cards">
          {purchases.map((po) => (
            <div key={po.id} className="purchase-card">
              <div className="card-header">
                <div>
                  <div className="card-id">{po.id}</div>
                  <div className="card-date">{po.date}</div>
                </div>
                <div className="card-actions">
                  <button className="edit-btn" title="Edit">
                    <Edit size={14} />
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(po.id)} title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="card-content">
                <div className="card-field">
                  <div className="card-label">Quotation ID</div>
                  <div className="card-value">{po.quotationId}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">PO Number</div>
                  <div className="card-value">{po.clientPONumber}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Amount</div>
                  <div className="card-value card-amount">₹{po.amountApproved.toLocaleString()}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Document</div>
                  <div className="card-value">{po.poDocument}</div>
                </div>
              </div>

              <div className="card-advance">
                <div className="card-label">Advance Received</div>
                <div className="card-value">{po.advanceReceived}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <>
          <div className="modal-overlay" onClick={() => setShowForm(false)}></div>
          <div className="form-modal">
            <div className="form-header">
              <h3 className="form-title">Add Purchase Order</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="enquiry-form">
              <div className="form-row">
                <div className="form-group">
                  <label>PO ID (Auto)</label>
                  <input
                    type="text"
                    readOnly
                    className="readonly-input"
                    value={`PO-${String(purchases.length + 1).padStart(3, '0')}`}
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
                <label>Linked Quotation ID</label>
                <input
                  type="text"
                  name="quotationId"
                  value={formData.quotationId}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Client PO Number</label>
                  <input
                    type="text"
                    name="clientPONumber"
                    value={formData.clientPONumber}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Amount Approved (₹)</label>
                  <input
                    type="number"
                    name="amountApproved"
                    value={formData.amountApproved}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Advance Received</label>
                <select
                  name="advanceReceived"
                  value={formData.advanceReceived}
                  onChange={handleChange}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="form-group">
                <label>PO Document Upload</label>
                <div className="file-upload">
                  <input
                    type="file"
                    name="poDocument"
                    id="poDocument"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    onChange={handleChange}
                  />
                  <label htmlFor="poDocument" className="upload-btn">
                    <Upload size={16} />
                    <span>{formData.poDocument?.name || 'Choose file'}</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Remarks</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder="Additional notes or instructions"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="clear-btn" onClick={resetForm}>
                  <RotateCcw size={16} />
                  <span>Clear</span>
                </button>
                <button type="submit" className="save-btn">
                  <Save size={16} />
                  <span>Save PO</span>
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Purchase;