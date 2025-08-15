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

const Ledger = () => {
  const [showForm, setShowForm] = useState(false);
  const [entries, setEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    clientName: '',
    type: 'Invoice',
    reference: '',
    debit: '',
    credit: ''
  });

  // Fetch ledger entries on component mount
  useEffect(() => {
    fetchLedgerEntries();
  }, []);

  const fetchLedgerEntries = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/ledger', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Handle different response structures
      let data = response.data;
      let entriesArr = [];
      if (Array.isArray(data)) {
        entriesArr = data;
      } else if (data && Array.isArray(data.ledgerEntries)) {
        entriesArr = data.ledgerEntries;
      } else if (data && Array.isArray(data.data)) {
        entriesArr = data.data;
      }

      // Transform backend fields to frontend fields and calculate running balance
      let runningBalance = 0;
      const mappedEntries = entriesArr.map(entry => {
        const debit = parseFloat(entry.debit || 0);
        const credit = parseFloat(entry.credit || 0);
        runningBalance += credit - debit;
        
        return {
          ...entry,
          clientName: entry.client_name ?? '',
          entryId: entry.entry_id ?? entry.id,
          debit: debit,
          credit: credit,
          balance: runningBalance
        };
      });

      setEntries(mappedEntries);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch ledger entries';
      toast.error(`Error: ${message}`);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getLatestBalance = () => {
    if (entries.length === 0) return 0;
    return entries[entries.length - 1].balance || 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.clientName || !formData.reference) {
      toast.warn('Please fill in all required fields');
      return;
    }

    const debit = parseFloat(formData.debit || 0);
    const credit = parseFloat(formData.credit || 0);

    if (debit === 0 && credit === 0) {
      toast.warn('Please enter either debit or credit amount');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (editingEntry) {
        // Update existing entry
        const updatePayload = {
          entry_id: editingEntry.entry_id || editingEntry.entryId,
          date: editingEntry.date || new Date().toISOString().split('T')[0],
          client_name: formData.clientName,
          type: formData.type,
          reference: formData.reference,
          debit: debit > 0 ? debit : null,
          credit: credit > 0 ? credit : null
        };

        await axios.put(`/ledger/${editingEntry.id || editingEntry._id}`, updatePayload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        toast.success('Ledger entry updated successfully!');
      } else {
        // Create new entry
        const createPayload = {
          entry_id: generateNextEntryId(),
          date: new Date().toISOString().split('T')[0],
          client_name: formData.clientName,
          type: formData.type,
          reference: formData.reference,
          debit: debit > 0 ? debit : null,
          credit: credit > 0 ? credit : null
        };

        await axios.post('/ledger', createPayload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        toast.success('Ledger entry added successfully!');
      }

      resetForm();
      setShowForm(false);
      fetchLedgerEntries(); // refresh the data
    } catch (error) {
      const message = error.response?.data?.message || 'Something went wrong';
      toast.error(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      clientName: entry.clientName || '',
      type: entry.type || 'Invoice',
      reference: entry.reference || '',
      debit: entry.debit > 0 ? entry.debit.toString() : '',
      credit: entry.credit > 0 ? entry.credit.toString() : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ledger entry?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(`/ledger/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Ledger entry deleted successfully!');
      fetchLedgerEntries(); // refresh after deletion
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete ledger entry';
      toast.error(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      type: 'Invoice',
      reference: '',
      debit: '',
      credit: ''
    });
    setEditingEntry(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    resetForm();
  };

  const formatCurrency = (amount) => {
    return amount ? `₹${amount.toLocaleString()}` : '-';
  };

  const generateNextEntryId = () => {
    if (!Array.isArray(entries) || entries.length === 0) {
      return 'ENT-001';
    }
    
    const maxId = Math.max(...entries.map(e => {
      const idField = e.entry_id || e.entryId || e.id;
      if (!idField) return 0;
      const idParts = idField.toString().split('-');
      return idParts && idParts[1] ? parseInt(idParts[1]) || 0 : 0;
    }));
    
    return `ENT-${String(maxId + 1).padStart(3, '0')}`;
  };

  // Filter entries based on search term
  const filteredEntries = Array.isArray(entries) ? entries.filter(entry =>
    entry.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.entry_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.entryId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.id?.toString() ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="enquiries-container">
      <style jsx>{`
        /* Mobile Card Styles */
        .ledger-cards {
          display: none;
        }

        .ledger-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
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

        .card-balance {
          background: #f0f9ff;
          padding: 8px 12px;
          border-radius: 6px;
          margin: 8px 0;
          text-align: center;
        }

        .card-balance .card-label {
          color: #0369a1;
        }

        .card-balance .card-value {
          color: #0369a1;
          font-weight: 600;
          font-size: 16px;
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

        /* Hide table on mobile, show cards */
        @media (max-width: 768px) {
          .table-wrapper {
            display: none;
          }
          
          .ledger-cards {
            display: block;
            padding: 0 16px 16px 16px;
          }

          .ledger-card:last-child {
            margin-bottom: 24px;
          }
          
          .page-header {
            padding: 0 16px;
          }

          .table-header {
            padding: 16px;
          }
        }

        /* Very small screens */
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
              <span>Add Ledger Entry</span>
            </button>
            <button 
              className="export-btn" 
              onClick={() => {
                const dataStr = JSON.stringify(filteredEntries, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                const exportFileDefaultName = 'ledger-entries-export.json';
                
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
              placeholder="Search ledger entries..."
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
          <h3 className="table-title">Accounts Ledger</h3>
        </div>

        {/* Desktop Table View */}
        <div className="table-wrapper">
          <table className="enquiries-table">
            <thead>
              <tr>
                <th>Entry ID</th>
                <th>Date</th>
                <th>Client</th>
                <th>Type</th>
                <th>Reference</th>
                <th>Debit (₹)</th>
                <th>Credit (₹)</th>
                <th>Balance (₹)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map(entry => (
                <tr key={entry.id || entry._id}>
                  <td className="enquiry-id">{entry.entry_id || entry.entryId}</td>
                  <td>{entry.date}</td>
                  <td className="client-name">{entry.clientName}</td>
                  <td>{entry.type}</td>
                  <td>{entry.reference}</td>
                  <td>{formatCurrency(entry.debit)}</td>
                  <td>{formatCurrency(entry.credit)}</td>
                  <td>{formatCurrency(entry.balance)}</td>
                  <td className="actions">
                    <button 
                      className="edit-btn" 
                      title="Edit" 
                      onClick={() => handleEdit(entry)}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(entry.id || entry._id)}
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
        <div className="ledger-cards">
          {filteredEntries.map(entry => (
            <div key={entry.id || entry._id} className="ledger-card">
              <div className="card-header">
                <div>
                  <div className="card-id">{entry.entry_id || entry.entryId}</div>
                  <div className="card-date">{entry.date}</div>
                </div>
                <div className="card-actions">
                  <button 
                    className="edit-btn" 
                    title="Edit" 
                    onClick={() => handleEdit(entry)}
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(entry.id || entry._id)}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="card-content">
                <div className="card-field">
                  <div className="card-label">Client</div>
                  <div className="card-value">{entry.clientName}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Type</div>
                  <div className="card-value">{entry.type}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Reference</div>
                  <div className="card-value">{entry.reference}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Debit</div>
                  <div className="card-value">{formatCurrency(entry.debit)}</div>
                </div>
                <div className="card-field">
                  <div className="card-label">Credit</div>
                  <div className="card-value">{formatCurrency(entry.credit)}</div>
                </div>
              </div>

              <div className="card-balance">
                <div className="card-label">Balance</div>
                <div className="card-value">{formatCurrency(entry.balance)}</div>
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
                {editingEntry ? 'Edit Ledger Entry' : 'Add Ledger Entry'}
              </h3>
              <button className="close-btn" onClick={handleCloseForm}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="enquiry-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Entry ID {editingEntry ? '' : '(Auto)'}</label>
                  <input
                    type="text"
                    readOnly
                    className="readonly-input"
                    value={editingEntry ? (editingEntry.entry_id || editingEntry.entryId) : generateNextEntryId()}
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    readOnly
                    className="readonly-input"
                    value={editingEntry ? editingEntry.date : new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Client Name *</label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="Enter client name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="Invoice">Invoice</option>
                  <option value="Receipt">Receipt</option>
                  <option value="Adjustment">Adjustment</option>
                  <option value="Salary">Salary</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>

              <div className="form-group">
                <label>Reference (Invoice ID / Receipt ID) *</label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  placeholder="Enter reference"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Debit (₹)</label>
                  <input
                    type="number"
                    name="debit"
                    value={formData.debit}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>Credit (₹)</label>
                  <input
                    type="number"
                    name="credit"
                    value={formData.credit}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="clear-btn" onClick={resetForm}>
                  <RotateCcw size={16} />
                  <span>Clear</span>
                </button>
                <button type="submit" className="save-btn" disabled={loading}>
                  <Save size={16} />
                  <span>{loading ? 'Saving...' : (editingEntry ? 'Update Entry' : 'Save Entry')}</span>
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Ledger;