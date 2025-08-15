import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  RotateCcw,
  Upload
} from 'lucide-react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import './component.css';

const Purchase = () => {
  const [showForm, setShowForm] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPO, setEditingPO] = useState(null);

  const [formData, setFormData] = useState({
    quotationId: '',
    clientPONumber: '',
    amountApproved: '',
    advanceReceived: 'No',
    poDocument: null,
    remarks: ''
  });

  // Fetch purchase orders from backend
  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/purchase-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = response.data;
      let purchaseArray = [];
      
      if (Array.isArray(data)) {
        purchaseArray = data;
      } else if (data?.data) {
        purchaseArray = Array.isArray(data.data) ? data.data : [data.data];
      } else if (data?.purchaseOrders) {
        purchaseArray = Array.isArray(data.purchaseOrders) ? data.purchaseOrders : [data.purchaseOrders];
      }

      // Updated mapping to handle both backend field name variations
      const mapped = purchaseArray.map(po => {
        // Helper function to safely extract numeric amount
        const extractAmount = (value) => {
          if (!value) return 0;
          // If it's already a number, return it
          if (typeof value === 'number') return value;
          // If it's a string, remove currency symbols and parse
          if (typeof value === 'string') {
            const numericValue = value.replace(/[₹$,\s]/g, '');
            const parsed = parseFloat(numericValue);
            return isNaN(parsed) ? 0 : parsed;
          }
          return 0;
        };

        // Helper function to extract filename from URL or return the value as-is
        const extractFilename = (value) => {
          if (!value || value === 'N/A') return 'N/A';
          if (typeof value === 'string' && value.includes('/')) {
            // Extract filename from URL path
            const parts = value.split('/');
            return parts[parts.length - 1];
          }
          return value;
        };

        return {
          id: po.id, // Keep the numeric database ID
          poId: po.po_id, // Keep the string PO ID (PO-001, etc.)
          date: po.date || (po.createdAt ? new Date(po.createdAt).toISOString().split('T')[0] : ''),
          quotationId: po.linked_quotation_id || po.quotation_id,
          clientPONumber: po.client_po_number || po.po_number,
          // Fix: Handle both field names and extract numeric value properly
          amountApproved: extractAmount(po.amount_approved || po.amount),
          // Fix: Handle both 'advance_received' and 'advance' field names  
          advanceReceived: (po.advance_received || po.advance === 'Yes') ? 'Yes' : 'No',
          // Fix: Extract filename from document URL
          poDocument: extractFilename(po.po_document || po.document),
          remarks: po.remarks || '',
          createdAt: po.createdAt
        };
      });

      setPurchases(mapped);
    } catch (error) {
      toast.error('Failed to fetch purchase orders');
      console.error('Fetch error:', error);
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate next PO ID
  const generateNextPOId = () => {
    if (!Array.isArray(purchases) || purchases.length === 0) {
      return 'PO-001';
    }
    
    const maxId = Math.max(...purchases.map(po => {
      const idField = po.poId;
      if (!idField) return 0;
      const idParts = idField.split('-');
      return idParts && idParts[1] ? parseInt(idParts[1]) || 0 : 0;
    }));
    
    return `PO-${String(maxId + 1).padStart(3, '0')}`;
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const payload = new FormData();
    
    // Convert 'Yes'/'No' back to boolean for backend
    const advanceReceivedBool = formData.advanceReceived === 'Yes';
    
    // Add po_id for new entries (but not the numeric id field)
    if (!editingPO) {
      payload.append('po_id', generateNextPOId());
      // Also add the date for new entries
      payload.append('date', new Date().toISOString().split('T')[0]);
    }
    
    payload.append('linked_quotation_id', formData.quotationId);
    payload.append('client_po_number', formData.clientPONumber);
    payload.append('amount_approved', formData.amountApproved);
    payload.append('advance_received', advanceReceivedBool);
    payload.append('remarks', formData.remarks);
    
    if (formData.poDocument) {
      payload.append('po_document', formData.poDocument);
    }

    try {
      setLoading(true);
      if (editingPO) {
        // Use the numeric id for updates, not the po_id string
        const updateId = editingPO.id;
        await axios.put(`/purchase-orders/${updateId}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Purchase order updated!');
      } else {
        const response = await axios.post('/purchase-orders', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Purchase order added!');
      }
      fetchPurchases();
      resetForm();
      setEditingPO(null);
      setShowForm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save purchase order');
      console.error('Submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (po) => {
    setEditingPO(po);
    setFormData({
      quotationId: po.quotationId,
      clientPONumber: po.clientPONumber,
      amountApproved: po.amountApproved,
      advanceReceived: po.advanceReceived,
      poDocument: null,
      remarks: po.remarks
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPO(null);
    resetForm();
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

  const handleDelete = async (po) => {
    if (window.confirm('Are you sure you want to delete this PO?')) {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        // Use the numeric id for deletion, not the po_id string
        const deleteId = po.id;
        await axios.delete(`/purchase-orders/${deleteId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Purchase order deleted!');
        fetchPurchases();
      } catch (error) {
        toast.error('Failed to delete purchase order');
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredPurchases = Array.isArray(purchases)
    ? purchases.filter(po =>
        String(po.poId ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(po.quotationId ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(po.clientPONumber ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(po.amountApproved ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(po.advanceReceived ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(po.poDocument ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(po.remarks ?? '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="enquiries-container">
      <style jsx>{`
        .purchase-cards { display: none; }
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
        .card-id { font-weight: 600; color: #111827; font-size: 14px; }
        .card-date { font-size: 12px; color: #6b7280; }
        .card-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 12px;
        }
        .card-field { display: flex; flex-direction: column; }
        .card-label {
          font-size: 11px;
          color: #6b7280;
          text-transform: uppercase;
          font-weight: 500;
          letter-spacing: 0.05em;
          margin-bottom: 2px;
        }
        .card-value { font-size: 13px; color: #374151; font-weight: 500; }
        .card-amount { font-weight: 600; color: #111827; }
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
          .table-wrapper { display: none; }
          .purchase-cards { display: block; padding: 0 16px 32px; }
          .purchase-card:last-child { margin-bottom: 24px; }
          .page-header { padding: 0 16px; }
          .table-header { padding: 16px; }
        }
        @media (max-width: 480px) {
          .card-content { grid-template-columns: 1fr; }
          .card-actions { justify-content: center; }
        }
      `}</style>

      {loading && (
        <div className="loading-overlay">Loading...</div>
      )}

      <div className="page-header">
        <div className="header-actions">
          <div className="action-buttons">
            <button className="add-btn" onClick={() => { setShowForm(true); setEditingPO(null); resetForm(); }}>
              <Plus size={20} />
              <span>Add Purchase Order</span>
            </button>
            <button
              className="export-btn"
              onClick={() => {
                const dataStr = JSON.stringify(filteredPurchases, null, 2);
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
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
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
        .action-buttons { display: flex; gap: 12px; }
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
        .add-btn { background-color: #3b82f6; color: white; border: 1px solid #3b82f6; }
        .add-btn:hover { background-color: #2563eb; border-color: #2563eb; }
        .export-btn { background-color: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; }
        .export-btn:hover { background-color: #e5e7eb; }
        .search-container { position: relative; width: 100%; }
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
          .search-container { width: auto; min-width: 200px; max-width: 300px; }
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
              {filteredPurchases.map((po) => (
                <tr key={po.id}>
                  <td>{po.poId}</td>
                  <td>{po.date}</td>
                  <td>{po.quotationId}</td>
                  <td>{po.clientPONumber}</td>
                  <td>₹{Number(po.amountApproved).toLocaleString()}</td>
                  <td>{po.advanceReceived}</td>
                  <td>{typeof po.poDocument === 'string' ? po.poDocument : (po.poDocument?.name ?? 'N/A')}</td>
                  <td className="actions">
                    <button className="edit-btn" title="Edit" onClick={() => handleEdit(po)}>
                      <Edit size={16} />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(po)}
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
          {filteredPurchases.map((po) => (
            <div key={po.id} className="purchase-card">
              <div className="card-header">
                <div>
                  <div className="card-id">{po.poId}</div>
                  <div className="card-date">{po.date}</div>
                </div>
                <div className="card-actions">
                  <button className="edit-btn" title="Edit" onClick={() => handleEdit(po)}>
                    <Edit size={14} />
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(po)} title="Delete">
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
                  <div className="card-value card-amount">₹{Number(po.amountApproved).toLocaleString()}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Document</div>
                  <div className="card-value">{typeof po.poDocument === 'string' ? po.poDocument : (po.poDocument?.name ?? 'N/A')}</div>
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
          <div className="modal-overlay" onClick={handleCloseForm}></div>
          <div className="form-modal">
            <div className="form-header">
              <h3 className="form-title">{editingPO ? 'Edit Purchase Order' : 'Add Purchase Order'}</h3>
              <button className="close-btn" onClick={handleCloseForm}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="enquiry-form">
              <div className="form-row">
                <div className="form-group">
                  <label>PO ID {editingPO ? '' : '(Auto)'}</label>
                  <input
                    type="text"
                    readOnly
                    className="readonly-input"
                    value={editingPO ? editingPO.poId : generateNextPOId()}
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    readOnly
                    className="readonly-input"
                    value={editingPO 
                      ? (editingPO.date || new Date(editingPO.createdAt).toISOString().split('T')[0])
                      : new Date().toISOString().split('T')[0]
                    }
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Linked Quotation ID *</label>
                <input
                  type="text"
                  name="quotationId"
                  value={formData.quotationId}
                  onChange={handleChange}
                  placeholder="Enter linked quotation ID"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Client PO Number *</label>
                  <input
                    type="text"
                    name="clientPONumber"
                    value={formData.clientPONumber}
                    onChange={handleChange}
                    placeholder="Enter client PO number"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Amount Approved (₹) *</label>
                  <input
                    type="number"
                    name="amountApproved"
                    value={formData.amountApproved}
                    onChange={handleChange}
                    placeholder="Enter approved amount"
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
                {editingPO && typeof editingPO.poDocument === 'string' && (
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                    Current: {editingPO.poDocument}
                  </div>
                )}
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
                <button type="submit" className="save-btn" disabled={loading}>
                  <Save size={16} />
                  <span>{loading ? 'Saving...' : (editingPO ? 'Update PO' : 'Save PO')}</span>
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