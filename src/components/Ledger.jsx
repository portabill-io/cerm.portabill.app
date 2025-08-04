import React, { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  RotateCcw
} from 'lucide-react';

const Ledger = () => {
  const [showForm, setShowForm] = useState(false);
  const [entries, setEntries] = useState([
    {
      id: 'LED-001',
      date: '2025-07-31',
      clientName: 'ABC Pvt Ltd',
      type: 'Invoice',
      reference: 'INV-001',
      debit: 0,
      credit: 50000,
      balance: 50000
    }
  ]);

  const [formData, setFormData] = useState({
    clientName: '',
    type: 'Invoice',
    reference: '',
    debit: '',
    credit: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getLatestBalance = () => {
    if (entries.length === 0) return 0;
    return entries[entries.length - 1].balance;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newDebit = parseFloat(formData.debit || 0);
    const newCredit = parseFloat(formData.credit || 0);
    const lastBalance = getLatestBalance();
    const newBalance = lastBalance + newCredit - newDebit;

    const newEntry = {
      id: `LED-${String(entries.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      ...formData,
      debit: newDebit,
      credit: newCredit,
      balance: newBalance
    };

    setEntries(prev => [...prev, newEntry]);
    resetForm();
    setShowForm(false);
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      type: 'Invoice',
      reference: '',
      debit: '',
      credit: ''
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this ledger entry?')) {
      const updated = entries.filter(entry => entry.id !== id);
      // Recalculate balance
      let runningBalance = 0;
      const recalculated = updated.map((entry, i) => {
        runningBalance += entry.credit - entry.debit;
        return { ...entry, balance: runningBalance };
      });
      setEntries(recalculated);
    }
  };

  const formatCurrency = (amount) => {
    return amount ? `₹${amount.toLocaleString()}` : '-';
  };

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

        /* Hide table on mobile, show cards */
        @media (max-width: 768px) {
          .table-wrapper {
            display: none;
          }
          
          .ledger-cards {
            display: block;
            padding: 0 16px 16px 32px;
          }
.leger-card:last-child {
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
          const dataStr = JSON.stringify(ledgerEntries, null, 2);
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
              {entries.map(entry => (
                <tr key={entry.id}>
                  <td className="enquiry-id">{entry.id}</td>
                  <td>{entry.date}</td>
                  <td className="client-name">{entry.clientName}</td>
                  <td>{entry.type}</td>
                  <td>{entry.reference}</td>
                  <td>{formatCurrency(entry.debit)}</td>
                  <td>{formatCurrency(entry.credit)}</td>
                  <td>{formatCurrency(entry.balance)}</td>
                  <td className="actions">
                    <button className="edit-btn" title="Edit" disabled>
                      <Edit size={16} />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(entry.id)}
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
          {entries.map(entry => (
            <div key={entry.id} className="ledger-card">
              <div className="card-header">
                <div>
                  <div className="card-id">{entry.id}</div>
                  <div className="card-date">{entry.date}</div>
                </div>
                <div className="card-actions">
                  <button className="edit-btn" title="Edit" disabled>
                    <Edit size={14} />
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(entry.id)}
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

      {/* Modal */}
      {showForm && (
        <>
          <div className="modal-overlay" onClick={() => setShowForm(false)}></div>
          <div className="form-modal">
            <div className="form-header">
              <h3 className="form-title">Add Ledger Entry</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="enquiry-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Entry ID (Auto)</label>
                  <input
                    type="text"
                    readOnly
                    className="readonly-input"
                    value={`LED-${String(entries.length + 1).padStart(3, '0')}`}
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
                <label>Client Name</label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option>Invoice</option>
                  <option>Receipt</option>
                  <option>Adjustment</option>
                  <option>Salary</option>
                  <option>Expense</option>
                </select>
              </div>

              <div className="form-group">
                <label>Reference (Invoice ID / Receipt ID)</label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
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
                  />
                </div>
                <div className="form-group">
                  <label>Credit (₹)</label>
                  <input
                    type="number"
                    name="credit"
                    value={formData.credit}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="clear-btn" onClick={resetForm}>
                  <RotateCcw size={16} />
                  <span>Clear</span>
                </button>
                <button type="button" className="save-btn" onClick={handleSubmit}>
                  <Save size={16} />
                  <span>Save Entry</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Ledger;