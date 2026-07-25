import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { FiPlus, FiAlertTriangle, FiTrash2, FiSearch, FiDollarSign, FiEdit, FiFolder } from 'react-icons/fi';

const PharmacyDashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [search, setSearch] = useState('');

  // Hospital ID Context (Assume default Apex Hospital ID = 1 for the pharmacy portal login)
  const hospitalId = 1;

  // Dispensing Form States
  const [patientUmrn, setPatientUmrn] = useState('');
  const [patientPrescriptions, setPatientPrescriptions] = useState([]);
  const [dispenseForm, setDispenseForm] = useState({ recordId: '', medicineId: '', quantity: 1 });
  
  // Modals / Forms
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState({ medicineId: '', stockQuantity: 100, expiryDate: '', unitPrice: 5.0, supplierName: '' });

  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [invRes, medsRes, lowRes, expRes] = await Promise.all([
        API.get(`/pharmacy/inventory?hospitalId=${hospitalId}`),
        API.get('/search?query=a'), // Generic lookup to load available seeded medicines
        API.get(`/pharmacy/low-stock?hospitalId=${hospitalId}`),
        API.get(`/pharmacy/expiring?hospitalId=${hospitalId}`)
      ]);

      setInventory(invRes.data);
      setMedicines(medsRes.data.medicines || []);
      setLowStock(lowRes.data);
      setExpiring(expRes.data);

      if (medsRes.data.medicines?.length > 0) {
        setItemForm(prev => ({ ...prev, medicineId: medsRes.data.medicines[0].id }));
        setDispenseForm(prev => ({ ...prev, medicineId: medsRes.data.medicines[0].id }));
      }
    } catch (error) {
      console.error("Error loading pharmacy details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = async (e) => {
    const val = e.target.value;
    setSearch(val);
    try {
      const res = await API.get(`/pharmacy/inventory?hospitalId=${hospitalId}&search=${val}`);
      setInventory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Add / Edit Inventory Item
  const handleItemSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const payload = {
        ...itemForm,
        hospitalId: hospitalId,
        medicineId: parseInt(itemForm.medicineId)
      };

      if (editingItem) {
        const res = await API.put(`/pharmacy/inventory/${editingItem.id}`, payload);
        setInventory(prev => prev.map(item => item.id === editingItem.id ? res.data : item));
        setSuccessMsg("Inventory item updated successfully!");
      } else {
        const res = await API.post('/pharmacy/inventory', payload);
        setInventory(prev => [...prev, res.data]);
        setSuccessMsg("Medicine stock added successfully!");
      }

      setShowItemModal(false);
      setEditingItem(null);
      setItemForm({ medicineId: medicines[0]?.id || '', stockQuantity: 100, expiryDate: '', unitPrice: 5.0, supplierName: '' });
      
      // Reload alerts
      const [lowRes, expRes] = await Promise.all([
        API.get(`/pharmacy/low-stock?hospitalId=${hospitalId}`),
        API.get(`/pharmacy/expiring?hospitalId=${hospitalId}`)
      ]);
      setLowStock(lowRes.data);
      setExpiring(expRes.data);

      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg("Failed to save inventory item.");
    }
  };

  const handleEditOpen = (item) => {
    setEditingItem(item);
    setItemForm({
      medicineId: item.medicine?.id,
      stockQuantity: item.stockQuantity,
      expiryDate: item.expiryDate,
      unitPrice: item.unitPrice,
      supplierName: item.supplierName
    });
    setShowItemModal(true);
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this stock item?")) return;
    try {
      await API.delete(`/pharmacy/inventory/${itemId}`);
      setInventory(prev => prev.filter(item => item.id !== itemId));
      setSuccessMsg("Item deleted successfully!");
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg("Failed to delete item.");
    }
  };

  // Retrieve Patient Prescriptions for Dispensing
  const handlePatientSearch = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setPatientPrescriptions([]);
    try {
      const res = await API.get(`/medical-records/${patientUmrn}`);
      setPatientPrescriptions(res.data);
      if (res.data.length > 0) {
        setDispenseForm(prev => ({ ...prev, recordId: res.data[0].id }));
      } else {
        setErrorMsg("No active records found for this UMRN.");
      }
    } catch (err) {
      setErrorMsg("Patient profile not found.");
    }
  };

  // Dispense Medicine Submit
  const handleDispenseSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await API.post(
        `/pharmacy/dispense?recordId=${dispenseForm.recordId}&medicineId=${dispenseForm.medicineId}&quantity=${dispenseForm.quantity}`
      );
      setSuccessMsg("Medicines dispensed and stock updated successfully!");
      
      // Reload inventory
      const [invRes, lowRes] = await Promise.all([
        API.get(`/pharmacy/inventory?hospitalId=${hospitalId}`),
        API.get(`/pharmacy/low-stock?hospitalId=${hospitalId}`)
      ]);
      setInventory(invRes.data);
      setLowStock(lowRes.data);

      setPatientUmrn('');
      setPatientPrescriptions([]);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to dispense medicine.");
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5 py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Inventory...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Messages */}
      {successMsg && <div className="alert alert-success text-start">✓ {successMsg}</div>}
      {errorMsg && <div className="alert alert-danger text-start">❌ {errorMsg}</div>}

      {/* Header Banner */}
      <div className="glass-panel p-4 mb-4 d-flex justify-content-between align-items-center text-start">
        <div>
          <h2 className="fw-bold m-0 text-primary">Pharmacy Inventory Console</h2>
          <p className="text-muted m-0">Manage medicine supplies, check stock alerts, and verify patient prescriptions.</p>
        </div>
        <button 
          className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 border-0"
          onClick={() => { setEditingItem(null); setShowItemModal(true); }}
        >
          <FiPlus /> Add Inventory Stock
        </button>
      </div>

      {/* Expiry & Low Stock Alerts */}
      <div className="row g-4 mb-4 text-start">
        <div className="col-md-6">
          <div className="glass-panel p-4 h-100 border border-danger border-opacity-20 bg-danger bg-opacity-5">
            <h5 className="fw-bold text-danger d-flex align-items-center gap-2 mb-3">
              <FiAlertTriangle className="emergency-pulse" /> Low Stock Alerts (threshold &lt; 10)
            </h5>
            {lowStock.length === 0 ? (
              <p className="small text-muted mb-0">All medicine stocks are within safety parameters.</p>
            ) : (
              <div className="list-group list-group-flush">
                {lowStock.map(item => (
                  <div key={item.id} className="list-group-item bg-transparent text-dark border-0 px-0 py-1">
                    <strong className="text-danger">{item.medicine?.name}</strong>: Only <strong>{item.stockQuantity}</strong> remaining (Supplier: {item.supplierName})
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="glass-panel p-4 h-100 border border-warning border-opacity-20 bg-warning bg-opacity-5">
            <h5 className="fw-bold text-warning-emphasis d-flex align-items-center gap-2 mb-3">
              ⚠️ Expiry Warnings (within 30 days)
            </h5>
            {expiring.length === 0 ? (
              <p className="small text-muted mb-0">No inventory batches are approaching expiration.</p>
            ) : (
              <div className="list-group list-group-flush">
                {expiring.map(item => (
                  <div key={item.id} className="list-group-item bg-transparent text-dark border-0 px-0 py-1">
                    <strong className="text-warning-emphasis">{item.medicine?.name}</strong>: Expires on <span className="fw-bold">{item.expiryDate}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Sections: Inventory + Dispense Panel */}
      <div className="row g-4 text-start">
        {/* Inventory Directory */}
        <div className="col-lg-7">
          <div className="glass-panel p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold m-0 text-secondary">Drug Inventory</h5>
              
              {/* Search Bar */}
              <div className="input-group" style={{ maxWidth: '280px' }}>
                <span className="input-group-text bg-white border-end-0 text-muted"><FiSearch /></span>
                <input 
                  type="text" 
                  className="form-control form-control-glass border-start-0" 
                  placeholder="Search medicine name..."
                  value={search}
                  onChange={handleSearch}
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle border-0">
                <thead className="table-light">
                  <tr>
                    <th>Medicine</th>
                    <th>Supplier</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Expiry</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(item => (
                    <tr key={item.id}>
                      <td>
                        <strong className="d-block">{item.medicine?.name}</strong>
                        <small className="text-muted">{item.medicine?.genericName} ({item.medicine?.dosageForm})</small>
                      </td>
                      <td>{item.supplierName}</td>
                      <td>${item.unitPrice.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${item.stockQuantity < 10 ? 'bg-danger' : 'bg-success'}`}>
                          {item.stockQuantity} units
                        </span>
                      </td>
                      <td>{item.expiryDate}</td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-secondary border-0 p-1 me-1" onClick={() => handleEditOpen(item)}>
                          <FiEdit size={16} />
                        </button>
                        <button className="btn btn-sm btn-outline-danger border-0 p-1" onClick={() => handleDeleteItem(item.id)}>
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Dispense Desk */}
        <div className="col-lg-5">
          <div className="glass-panel p-4 h-100">
            <h5 className="fw-bold text-primary mb-3 border-bottom pb-2">📋 Prescription Dispense Desk</h5>
            
            <form onSubmit={handlePatientSearch} className="mb-4">
              <label className="form-label text-secondary small fw-bold">Patient UMRN</label>
              <div className="input-group">
                <input 
                  type="text" 
                  className="form-control form-control-glass" 
                  placeholder="e.g. UMRN100000000001"
                  value={patientUmrn}
                  onChange={(e) => setPatientUmrn(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary border-0 px-3">Search</button>
              </div>
            </form>

            {patientPrescriptions.length > 0 && (
              <div className="p-3 bg-light rounded-3 border mb-4">
                <div className="fw-bold mb-2">Prescription Records found:</div>
                {patientPrescriptions.map(record => (
                  <div key={record.id} className="small text-muted mb-2 border-bottom pb-2">
                    <span className="badge bg-secondary text-dark me-2">{record.visitDate}</span>
                    <strong>Diagnosis:</strong> {record.diagnosis}
                    <div className="mt-1 bg-white p-2 border rounded">
                      {record.prescription || 'No active drug prescriptions listed.'}
                    </div>
                  </div>
                ))}

                {/* Dispensing form */}
                <form onSubmit={handleDispenseSubmit} className="mt-3">
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">Select Visit Record</label>
                    <select 
                      className="form-select form-control-glass"
                      value={dispenseForm.recordId}
                      onChange={e => setDispenseForm({ ...dispenseForm, recordId: e.target.value })}
                      required
                    >
                      {patientPrescriptions.map(r => (
                        <option key={r.id} value={r.id}>{r.visitDate} - {r.diagnosis}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">Select Medicine</label>
                    <select 
                      className="form-select form-control-glass"
                      value={dispenseForm.medicineId}
                      onChange={e => setDispenseForm({ ...dispenseForm, medicineId: e.target.value })}
                      required
                    >
                      {inventory.map(i => (
                        <option key={i.id} value={i.medicine?.id}>{i.medicine?.name} ({i.stockQuantity} available)</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold">Quantity to Dispense</label>
                    <input 
                      type="number" 
                      className="form-control form-control-glass"
                      min="1"
                      value={dispenseForm.quantity}
                      onChange={e => setDispenseForm({ ...dispenseForm, quantity: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-success w-100 border-0 py-2 fw-semibold">
                    Dispense Medications
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Stock Modal */}
      {showItemModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', overflowY: 'auto' }}>
          <div className="modal-dialog">
            <div className="modal-content glass-panel text-start">
              <div className="modal-header">
                <h5 className="modal-title fw-bold text-primary">
                  {editingItem ? '✏️ Edit Stock Item' : '💊 Add Medicine Stock'}
                </h5>
                <button type="button" className="btn-close" onClick={() => { setShowItemModal(false); setEditingItem(null); }}></button>
              </div>
              <form onSubmit={handleItemSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label text-secondary">Medicine Formula</label>
                    <select 
                      className="form-select form-control-glass" 
                      value={itemForm.medicineId}
                      onChange={e => setItemForm({ ...itemForm, medicineId: e.target.value })}
                      disabled={editingItem !== null}
                      required
                    >
                      {medicines.map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.genericName} - {m.strength})</option>
                      ))}
                    </select>
                  </div>
                  <div className="row g-2">
                    <div className="col-6 mb-3">
                      <label className="form-label text-secondary">Stock Quantity</label>
                      <input 
                        type="number" 
                        className="form-control form-control-glass" 
                        value={itemForm.stockQuantity}
                        onChange={e => setItemForm({ ...itemForm, stockQuantity: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="col-6 mb-3">
                      <label className="form-label text-secondary">Unit Price ($)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        className="form-control form-control-glass" 
                        value={itemForm.unitPrice}
                        onChange={e => setItemForm({ ...itemForm, unitPrice: parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary">Expiry Date</label>
                    <input 
                      type="date" 
                      className="form-control form-control-glass" 
                      value={itemForm.expiryDate}
                      onChange={e => setItemForm({ ...itemForm, expiryDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary">Supplier Name</label>
                    <input 
                      type="text" 
                      className="form-control form-control-glass" 
                      value={itemForm.supplierName}
                      onChange={e => setItemForm({ ...itemForm, supplierName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => { setShowItemModal(false); setEditingItem(null); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary border-0">Save Item</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyDashboard;
