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

const Receipt = () => {
  const [showForm, setShowForm] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    linkedInvoiceId: '',
    paymentMode: 'Bank Transfer',
    amount: '',
    paymentReference: '',
    remarks: ''
  });

  // Fetch receipts on component mount
  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/receipts', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Ensure we always get an array
      let data = response.data;
      let receiptsArr = [];
      if (Array.isArray(data)) {
        receiptsArr = data;
      } else if (data && Array.isArray(data.receipts)) {
        receiptsArr = data.receipts;
      } else if (data && Array.isArray(data.data)) {
        receiptsArr = data.data;
      }

      // Transform backend fields to frontend fields
      const mappedReceipts = receiptsArr.map(r => ({
        ...r,
        receiptId: r.receipt_id ?? '',
        linkedInvoiceId: r.linked_invoice_id ?? '',
        paymentMode: r.payment_mode ?? '',
        paymentReference: r.payment_reference ?? '',
        amountReceived: r.amount_received ?? 0,
        remarks: r.remarks ?? ''
      }));

      setReceipts(mappedReceipts);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch receipts';
      toast.error(`Error: ${message}`);
      setReceipts([]);
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
    
    if (!formData.linkedInvoiceId || !formData.paymentMode || !formData.amount) {
      toast.warn('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (editingReceipt) {
        // Update existing receipt
        const updatePayload = {
          receipt_id: editingReceipt.receipt_id || editingReceipt.receiptId,
          date: editingReceipt.date || new Date().toISOString().split('T')[0],
          linked_invoice_id: formData.linkedInvoiceId,
          payment_mode: formData.paymentMode,
          payment_reference: formData.paymentReference,
          amount_received: parseFloat(formData.amount),
          remarks: formData.remarks
        };

        const response = await axios.put(`/receipts/${editingReceipt.id || editingReceipt._id}`, updatePayload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        toast.success('Receipt updated successfully!');
        handleClear();
        setShowForm(false);
        fetchReceipts();
      } else {
        // Create new receipt
        const createPayload = {
          receipt_id: generateNextReceiptId(),
          date: new Date().toISOString().split('T')[0],
          linked_invoice_id: formData.linkedInvoiceId,
          payment_mode: formData.paymentMode,
          payment_reference: formData.paymentReference,
          amount_received: parseFloat(formData.amount),
          remarks: formData.remarks
        };

        const response = await axios.post('/receipts', createPayload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        toast.success('Receipt added successfully!');
        handleClear();
        setShowForm(false);
        fetchReceipts();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Something went wrong';
      toast.error(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (receipt) => {
    setEditingReceipt(receipt);
    setFormData({
      linkedInvoiceId: receipt.linkedInvoiceId || '',
      paymentMode: receipt.paymentMode || 'Bank Transfer',
      amount: receipt.amountReceived?.toString() || '',
      paymentReference: receipt.paymentReference || '',
      remarks: receipt.remarks || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this receipt?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(`/receipts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setReceipts(prev => prev.filter(receipt => receipt.id !== id));
      toast.success('Receipt deleted successfully!');
      fetchReceipts();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete receipt';
      toast.error(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      linkedInvoiceId: '',
      paymentMode: 'Bank Transfer',
      amount: '',
      paymentReference: '',
      remarks: ''
    });
    setEditingReceipt(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    handleClear();
  };

  const getPaymentModeColor = (mode) => {
    switch (mode) {
      case 'Bank Transfer': return '#3b82f6';
      case 'Bank': return '#3b82f6';
      case 'UPI': return '#8b5cf6';
      case 'Cash': return '#10b981';
      case 'Cheque': return '#f59e0b';
      case 'Card': return '#ef4444';
      default: return '#9ca3af';
    }
  };

  const generateNextReceiptId = () => {
    if (!Array.isArray(receipts) || receipts.length === 0) {
      return 'R-001';
    }
    
    const maxId = Math.max(...receipts.map(r => {
      const idField = r.receipt_id || r.receiptId || r.id;
      if (!idField) return 0;
      const idParts = idField.split('-');
      return idParts && idParts[1] ? parseInt(idParts[1]) || 0 : 0;
    }));
    
    return `R-${String(maxId + 1).padStart(3, '0')}`;
  };

  // Filter receipts based on search term
  const filteredReceipts = Array.isArray(receipts) ? receipts.filter(receipt =>
    receipt.receiptId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.linkedInvoiceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.paymentMode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.paymentReference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (receipt.id?.toString() ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

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

          .receipt-cards {
            display: block;
            padding: 0 16px 32px;
          }

          .receipt-card:last-child {
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
              <span>Add Receipt</span>
            </button>
            <button 
              className="export-btn" 
              onClick={() => {
                const dataStr = JSON.stringify(filteredReceipts, null, 2);
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
              {filteredReceipts.map(r => (
                <tr key={r.id || r._id}>
                  <td>{r.receiptId || r.receipt_id}</td>
                  <td>{r.date || new Date(r.createdAt).toISOString().split('T')[0]}</td>
                  <td>{r.linkedInvoiceId}</td>
                  <td>
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getPaymentModeColor(r.paymentMode) }}
                    >
                      {r.paymentMode}
                    </span>
                  </td>
                  <td>₹{r.amountReceived?.toLocaleString() || '0'}</td>
                  <td>{r.paymentReference || '-'}</td>
                  <td>{r.remarks || '-'}</td>
                  <td className="actions">
                    <button 
                      className="edit-btn" 
                      title="Edit"
                      onClick={() => handleEdit(r)}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(r.id || r._id)}
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
          {filteredReceipts.map(r => (
            <div key={r.id || r._id} className="receipt-card">
              <div className="card-header">
                <div>
                  <div className="card-id">{r.receiptId || r.receipt_id}</div>
                  <div className="card-date">{r.date || new Date(r.createdAt).toISOString().split('T')[0]}</div>
                </div>
                <div className="card-actions">
                  <button 
                    className="edit-btn" 
                    title="Edit"
                    onClick={() => handleEdit(r)}
                  >
                    <Edit size={14} />
                  </button>
                  <button 
                    className="delete-btn" 
                    onClick={() => handleDelete(r.id || r._id)} 
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="card-content">
                <div className="card-field">
                  <div className="card-label">Invoice ID</div>
                  <div className="card-value">{r.linkedInvoiceId}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Amount</div>
                  <div className="card-value card-amount">₹{r.amountReceived?.toLocaleString() || '0'}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Reference No.</div>
                  <div className="card-value">{r.paymentReference || '-'}</div>
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
          <div className="modal-overlay" onClick={handleCloseForm}></div>
          <div className="form-modal">
            <div className="form-header">
              <h3 className="form-title">
                {editingReceipt ? 'Edit Receipt' : 'Add Receipt'}
              </h3>
              <button className="close-btn" onClick={handleCloseForm}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="enquiry-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Receipt ID {editingReceipt ? '' : '(Auto)'}</label>
                  <input
                    type="text"
                    value={editingReceipt 
                      ? (editingReceipt.receiptId || editingReceipt.receipt_id) 
                      : generateNextReceiptId()
                    }
                    readOnly
                    className="readonly-input"
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={editingReceipt 
                      ? (editingReceipt.date || new Date(editingReceipt.createdAt).toISOString().split('T')[0])
                      : new Date().toISOString().split('T')[0]
                    }
                    readOnly
                    className="readonly-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Linked Invoice ID *</label>
                <input
                  type="text"
                  name="linkedInvoiceId"
                  value={formData.linkedInvoiceId}
                  onChange={handleInputChange}
                  placeholder="Enter invoice ID"
                  required
                />
              </div>

              <div className="form-group">
                <label>Payment Mode *</label>
                <select
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Card">Card</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div className="form-group">
                <label>Amount Received (₹) *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>Payment Reference</label>
                <input
                  type="text"
                  name="paymentReference"
                  value={formData.paymentReference}
                  onChange={handleInputChange}
                  placeholder="UTR, Cheque No., Transaction ID, etc."
                />
              </div>

              <div className="form-group">
                <label>Remarks</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  placeholder="Optional notes or remarks"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="clear-btn" onClick={handleClear}>
                  <RotateCcw size={16} />
                  <span>Clear</span>
                </button>
                <button type="submit" className="save-btn" disabled={loading}>
                  <Save size={16} />
                  <span>{loading ? 'Saving...' : (editingReceipt ? 'Update Receipt' : 'Save Receipt')}</span>
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