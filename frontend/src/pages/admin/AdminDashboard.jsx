import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import AiInsightsPanel from '../../components/AiInsightsPanel';
import { FiPlus, FiGrid, FiUsers, FiBriefcase, FiHome, FiFileText, FiActivity, FiArrowLeft, FiHeart } from 'react-icons/fi';

const AdminDashboard = () => {
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [logs, setLogs] = useState([]);

  // Form toggles
  const [activePanel, setActivePanel] = useState('stats'); // 'stats', 'hospitals', 'doctors', 'departments', 'patients'
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  const [showHospModal, setShowHospModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);

  // Form states
  const [hospForm, setHospForm] = useState({ name: '', location: '', contact: '', availableBeds: 10, availableIcu: 2, hasMri: true });
  const [docForm, setDocForm] = useState({ name: '', specialization: '', contact: '', email: '', hospitalId: '', departmentId: '' });
  const [deptForm, setDeptForm] = useState({ name: '', hospitalId: '' });

  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [hospRes, docRes, deptRes, patRes, apptRes, logsRes] = await Promise.all([
        API.get('/hospitals'),
        API.get('/doctors'),
        API.get('/departments'),
        API.get('/patients'),
        API.get('/appointments'),
        API.get('/emergency/logs')
      ]);

      setHospitals(hospRes.data);
      setDoctors(docRes.data);
      setDepartments(deptRes.data);
      setPatients(patRes.data);
      setAppointments(apptRes.data);
      setLogs(logsRes.data);

      if (hospRes.data.length > 0) {
        setDocForm(prev => ({ ...prev, hospitalId: hospRes.data[0].id }));
        setDeptForm(prev => ({ ...prev, hospitalId: hospRes.data[0].id }));
      }
      if (deptRes.data.length > 0) {
        setDocForm(prev => ({ ...prev, departmentId: deptRes.data[0].id }));
      }
    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleHospitalSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/hospitals', hospForm);
      setHospitals(prev => [...prev, res.data]);
      setSuccessMsg("Hospital registered successfully!");
      setShowHospModal(false);
      setHospForm({ name: '', location: '', contact: '', availableBeds: 10, availableIcu: 2, hasMri: true });
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg("Failed to add hospital");
    }
  };

  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/doctors', docForm);
      setDoctors(prev => [...prev, res.data]);
      setSuccessMsg("Doctor added successfully!");
      setShowDocModal(false);
      setDocForm({ name: '', specialization: '', contact: '', email: '', hospitalId: hospitals[0]?.id, departmentId: departments[0]?.id });
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg("Failed to add doctor");
    }
  };

  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/departments', deptForm);
      setDepartments(prev => [...prev, res.data]);
      setSuccessMsg("Department added successfully!");
      setShowDeptModal(false);
      setDeptForm({ name: '', hospitalId: hospitals[0]?.id });
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg("Failed to add department");
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5 py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Messages */}
      {successMsg && <div className="alert alert-success text-start">✓ {successMsg}</div>}
      {errorMsg && <div className="alert alert-danger text-start">❌ {errorMsg}</div>}

      {/* Header */}
      <div className="glass-panel p-4 mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 text-start">
        <div>
          <h2 className="fw-bold m-0 text-primary">Master Admin Console</h2>
          <p className="text-muted m-0">Synchronize hospital resources, departments, and doctors across India.</p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button 
            className={`btn border-0 ${activePanel === 'stats' ? 'btn-primary' : 'btn-light text-muted'}`}
            onClick={() => setActivePanel('stats')}
          >
            <FiActivity className="me-1" /> Analytics
          </button>
          <button 
            className={`btn border-0 ${activePanel === 'hospitals' ? 'btn-primary' : 'btn-light text-muted'}`}
            onClick={() => setActivePanel('hospitals')}
          >
            <FiHome className="me-1" /> Hospitals
          </button>
          <button 
            className={`btn border-0 ${activePanel === 'doctors' ? 'btn-primary' : 'btn-light text-muted'}`}
            onClick={() => setActivePanel('doctors')}
          >
            <FiUsers className="me-1" /> Doctors
          </button>
          <button 
            className={`btn border-0 ${activePanel === 'departments' ? 'btn-primary' : 'btn-light text-muted'}`}
            onClick={() => setActivePanel('departments')}
          >
            <FiGrid className="me-1" /> Departments
          </button>
          <button 
            className={`btn border-0 ${activePanel === 'patients' ? 'btn-primary' : 'btn-light text-muted'}`}
            onClick={() => { setActivePanel('patients'); setSelectedPatient(null); }}
          >
            <FiUsers className="me-1" /> Patients
          </button>
        </div>
      </div>

      {activePanel === 'stats' && (
        <>
          {/* Stats widgets */}
          <div className="row g-4 mb-4 text-start">
            <div className="col-md-3">
              <div className="glass-panel p-4 d-flex align-items-center gap-3">
                <div className="fs-1">🏥</div>
                <div>
                  <h4 className="fw-bold m-0">{hospitals.length}</h4>
                  <small className="text-muted fw-semibold">Connected Hospitals</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="glass-panel p-4 d-flex align-items-center gap-3">
                <div className="fs-1">🩺</div>
                <div>
                  <h4 className="fw-bold m-0">{doctors.length}</h4>
                  <small className="text-muted fw-semibold">Active Doctors</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="glass-panel p-4 d-flex align-items-center gap-3">
                <div className="fs-1">👥</div>
                <div>
                  <h4 className="fw-bold m-0">{patients.length}</h4>
                  <small className="text-muted fw-semibold">Registered Patients</small>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="glass-panel p-4 d-flex align-items-center gap-3">
                <div className="fs-1">📅</div>
                <div>
                  <h4 className="fw-bold m-0">{appointments.length}</h4>
                  <small className="text-muted fw-semibold">Total Appointments</small>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Logs & Seeding info */}
          <div className="row g-4 text-start">
            <div className="col-lg-8">
              <div className="glass-panel p-4">
                <h5 className="fw-bold text-primary mb-3">🚨 Live Emergency Access Logs</h5>
                <div className="table-responsive">
                  <table className="table table-hover align-middle border-0">
                    <thead className="table-light">
                      <tr>
                        <th>Operator</th>
                        <th>Patient UMRN</th>
                        <th>Access Time</th>
                        <th>Hospital Context</th>
                        <th>Doctor</th>
                        <th>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map(log => (
                        <tr key={log.id}>
                          <td className="fw-bold text-danger">{log.accessedByUsername}</td>
                          <td className="fw-semibold">{log.patientUmrn}</td>
                          <td>{new Date(log.accessTime).toLocaleString()}</td>
                          <td>{log.hospitalName}</td>
                          <td className="fw-bold text-primary">{log.doctorName || 'Trauma Duty'}</td>
                          <td>{log.reason}</td>
                        </tr>
                      ))}
                      {logs.length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center text-muted">No emergency records loaded yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="glass-panel p-4 h-100">
                <h5 className="fw-bold text-primary mb-3">📈 Network Availability</h5>
                <div className="list-group list-group-flush">
                  {hospitals.map(h => (
                    <div key={h.id} className="list-group-item bg-transparent text-dark border-0 px-0 mb-2">
                      <div className="d-flex justify-content-between">
                        <strong className="text-truncate" style={{ maxWidth: '200px' }}>{h.name}</strong>
                        <span className={`badge ${h.availableBeds > 0 ? 'bg-success' : 'bg-danger'}`}>
                          {h.availableBeds} beds available
                        </span>
                      </div>
                      <small className="text-muted">{h.location}</small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activePanel === 'hospitals' && (
        <div className="glass-panel p-4 text-start">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold m-0 text-primary">Connected Hospital Directory</h5>
            <button className="btn btn-primary btn-sm border-0" onClick={() => setShowHospModal(true)}>
              <FiPlus /> Add Hospital
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle border-0">
              <thead className="table-light">
                <tr>
                  <th>Hospital Name</th>
                  <th>Location</th>
                  <th>Contact</th>
                  <th>Available Beds</th>
                  <th>ICU capacity</th>
                  <th>MRI scanner</th>
                </tr>
              </thead>
              <tbody>
                {hospitals.map(h => (
                  <tr key={h.id}>
                    <td className="fw-bold">{h.name}</td>
                    <td>{h.location}</td>
                    <td>{h.contact}</td>
                    <td>{h.availableBeds}</td>
                    <td>{h.availableIcu}</td>
                    <td>{h.hasMri ? '✓ Yes' : '✕ No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activePanel === 'doctors' && (
        <div className="glass-panel p-4 text-start">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold m-0 text-primary">Doctor Roster</h5>
            <button className="btn btn-primary btn-sm border-0" onClick={() => setShowDocModal(true)}>
              <FiPlus /> Add Doctor
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle border-0">
              <thead className="table-light">
                <tr>
                  <th>Doctor Name</th>
                  <th>Specialization</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Hospital</th>
                  <th>Department</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map(d => (
                  <tr key={d.id}>
                    <td className="fw-bold">{d.name}</td>
                    <td>{d.specialization}</td>
                    <td>{d.contact}</td>
                    <td>{d.email}</td>
                    <td>{d.hospital?.name}</td>
                    <td>{d.department?.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activePanel === 'departments' && (
        <div className="glass-panel p-4 text-start">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold m-0 text-primary">Specialty Departments</h5>
            <button className="btn btn-primary btn-sm border-0" onClick={() => setShowDeptModal(true)}>
              <FiPlus /> Add Department
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle border-0">
              <thead className="table-light">
                <tr>
                  <th>Department ID</th>
                  <th>Department Name</th>
                  <th>Hospital Location</th>
                </tr>
              </thead>
              <tbody>
                {departments.map(d => (
                  <tr key={d.id}>
                    <td>#{d.id}</td>
                    <td className="fw-bold">{d.name}</td>
                    <td>{d.hospital?.name} ({d.hospital?.location})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activePanel === 'patients' && (
        <div className="glass-panel p-4 text-start">
          {!selectedPatient ? (
            <>
              <h5 className="fw-bold mb-4 text-primary">Registered Patient Directory</h5>
              <div className="table-responsive">
                <table className="table table-hover align-middle border-0">
                  <thead className="table-light">
                    <tr>
                      <th>Patient Name</th>
                      <th>UMRN</th>
                      <th>DOB</th>
                      <th>Gender</th>
                      <th>Blood Group</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map(p => (
                      <tr key={p.id}>
                        <td className="fw-bold">{p.name}</td>
                        <td className="fw-semibold text-primary">{p.umrn}</td>
                        <td>{p.dob}</td>
                        <td>{p.gender}</td>
                        <td>{p.bloodGroup}</td>
                        <td className="text-end">
                          <button 
                            className="btn btn-primary btn-sm border-0 px-3 fw-bold"
                            onClick={() => setSelectedPatient(p)}
                          >
                            Clinical File & AI Insights
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div>
              <button 
                className="btn btn-light btn-sm mb-4 border d-flex align-items-center gap-2"
                onClick={() => setSelectedPatient(null)}
              >
                <FiArrowLeft /> Back to Directory
              </button>

              {/* Patient Core Demographics Card */}
              <div className="card p-4 bg-white border shadow-sm mb-4">
                <h5 className="fw-bold text-dark border-bottom pb-2 mb-3">🩺 Longitudinal Clinical File: {selectedPatient.name}</h5>
                <div className="row g-3">
                  <div className="col-md-3">
                    <span className="text-muted small d-block">UMRN</span>
                    <strong>{selectedPatient.umrn}</strong>
                  </div>
                  <div className="col-md-3">
                    <span className="text-muted small d-block">DATE OF BIRTH</span>
                    <strong>{selectedPatient.dob}</strong>
                  </div>
                  <div className="col-md-3">
                    <span className="text-muted small d-block">KNOWN ALLERGIES</span>
                    <strong className="text-danger">{selectedPatient.allergies || 'None'}</strong>
                  </div>
                  <div className="col-md-3">
                    <span className="text-muted small d-block">CHRONIC DISEASES</span>
                    <strong className="text-warning-emphasis">{selectedPatient.chronicDiseases || 'None'}</strong>
                  </div>
                </div>
              </div>

              {/* AI CDSS CLINICAL RECOMMENDATIONS AND INFERENCES PANEL */}
              <AiInsightsPanel umrn={selectedPatient.umrn} patientId={selectedPatient.id} />
            </div>
          )}
        </div>
      )}

      {/* Hospital Registration Modal */}
      {showHospModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', overflowY: 'auto' }}>
          <div className="modal-dialog">
            <div className="modal-content glass-panel text-start">
              <div className="modal-header">
                <h5 className="modal-title fw-bold text-primary">🏥 Register Hospital Facility</h5>
                <button type="button" className="btn-close" onClick={() => setShowHospModal(false)}></button>
              </div>
              <form onSubmit={handleHospitalSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label text-secondary">Hospital Name</label>
                    <input type="text" className="form-control form-control-glass" value={hospForm.name} onChange={e => setHospForm({ ...hospForm, name: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary">Location</label>
                    <input type="text" className="form-control form-control-glass" value={hospForm.location} onChange={e => setHospForm({ ...hospForm, location: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary">Contact Number</label>
                    <input type="text" className="form-control form-control-glass" value={hospForm.contact} onChange={e => setHospForm({ ...hospForm, contact: e.target.value })} required />
                  </div>
                  <div className="row g-2">
                    <div className="col-6 mb-3">
                      <label className="form-label text-secondary">Available Beds</label>
                      <input type="number" className="form-control form-control-glass" value={hospForm.availableBeds} onChange={e => setHospForm({ ...hospForm, availableBeds: parseInt(e.target.value) })} required />
                    </div>
                    <div className="col-6 mb-3">
                      <label className="form-label text-secondary">Available ICU Beds</label>
                      <input type="number" className="form-control form-control-glass" value={hospForm.availableIcu} onChange={e => setHospForm({ ...hospForm, availableIcu: parseInt(e.target.value) })} required />
                    </div>
                  </div>
                  <div className="mb-3 form-check">
                    <input type="checkbox" className="form-check-input" id="hasMriCheck" checked={hospForm.hasMri} onChange={e => setHospForm({ ...hospForm, hasMri: e.target.checked })} />
                    <label className="form-check-label text-secondary" htmlFor="hasMriCheck">Has MRI Scan Facility</label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowHospModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary border-0">Add Facility</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Modal */}
      {showDocModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', overflowY: 'auto' }}>
          <div className="modal-dialog">
            <div className="modal-content glass-panel text-start">
              <div className="modal-header">
                <h5 className="modal-title fw-bold text-primary">🩺 Add Medical Doctor</h5>
                <button type="button" className="btn-close" onClick={() => setShowDocModal(false)}></button>
              </div>
              <form onSubmit={handleDoctorSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label text-secondary">Doctor Name</label>
                    <input type="text" className="form-control form-control-glass" placeholder="Dr. Name" value={docForm.name} onChange={e => setDocForm({ ...docForm, name: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary">Specialization</label>
                    <input type="text" className="form-control form-control-glass" placeholder="e.g. Cardiology" value={docForm.specialization} onChange={e => setDocForm({ ...docForm, specialization: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary">Contact</label>
                    <input type="text" className="form-control form-control-glass" value={docForm.contact} onChange={e => setDocForm({ ...docForm, contact: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary">Email</label>
                    <input type="email" className="form-control form-control-glass" value={docForm.email} onChange={e => setDocForm({ ...docForm, email: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary">Treating Hospital</label>
                    <select className="form-select form-control-glass" value={docForm.hospitalId} onChange={e => setDocForm({ ...docForm, hospitalId: e.target.value })} required>
                      {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary">Department</label>
                    <select className="form-select form-control-glass" value={docForm.departmentId} onChange={e => setDocForm({ ...docForm, departmentId: e.target.value })} required>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name} ({d.hospital?.name})</option>)}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowDocModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary border-0">Add Doctor</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Department Modal */}
      {showDeptModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', overflowY: 'auto' }}>
          <div className="modal-dialog">
            <div className="modal-content glass-panel text-start">
              <div className="modal-header">
                <h5 className="modal-title fw-bold text-primary">🏥 Add Department</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeptModal(false)}></button>
              </div>
              <form onSubmit={handleDeptSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label text-secondary">Department Name</label>
                    <input type="text" className="form-control form-control-glass" placeholder="e.g. Pediatrics" value={deptForm.name} onChange={e => setDeptForm({ ...deptForm, name: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary">Hospital</label>
                    <select className="form-select form-control-glass" value={deptForm.hospitalId} onChange={e => setDeptForm({ ...deptForm, hospitalId: e.target.value })} required>
                      {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowDeptModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary border-0">Add Department</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
