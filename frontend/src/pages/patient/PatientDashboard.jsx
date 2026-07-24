import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import HealthCard from '../../components/HealthCard';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FiUser, FiCalendar, FiClock, FiActivity, FiSearch, FiAlertTriangle, FiBell, FiHeart, FiFileText } from 'react-icons/fi';

const PatientDashboard = () => {
  const { user } = useContext(AuthContext);
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'timeline', 'appointments', 'finder'
  const [loading, setLoading] = useState(true);

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({ doctorId: '', appointmentDate: '', reason: '' });
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');

  // Availability Finder State
  const [finderForm, setFinderForm] = useState({ hospitalId: '', resource: 'Bed', query: '', quantity: 1 });
  const [finderResult, setFinderResult] = useState(null);
  const [finderLoading, setFinderLoading] = useState(false);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const umrn = user?.umrn || localStorage.getItem('umrn');
      
      const [patRes, recRes, apptRes, hospRes, docRes] = await Promise.all([
        API.get(`/patients/${umrn}`),
        API.get(`/medical-records/${umrn}`),
        API.get(`/appointments/${umrn}`),
        API.get('/hospitals'),
        API.get('/doctors')
      ]);

      setPatient(patRes.data);
      setRecords(recRes.data);
      setAppointments(apptRes.data);
      setHospitals(hospRes.data);
      setDoctors(docRes.data);

      if (hospRes.data.length > 0) {
        setFinderForm(prev => ({ ...prev, hospitalId: hospRes.data[0].id }));
      }
      if (docRes.data.length > 0) {
        setBookingForm(prev => ({ ...prev, doctorId: docRes.data[0].id }));
      }

      // Fetch notifications
      const notifRes = await API.get(`/notifications/user/${patRes.data.id}`);
      setNotifications(notifRes.data);
    } catch (error) {
      console.error("Error loading patient dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, [user]);

  // Download Digital Health Card as PDF
  const handlePdfDownload = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [85, 120] // Typical identity card size
    });

    doc.setFillColor(240, 249, 255);
    doc.rect(0, 0, 120, 85, 'F');
    
    doc.setTextColor(2, 132, 199);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text("MEDISYNC UNIVERSAL HEALTH ID", 8, 12);
    
    doc.setDrawColor(2, 132, 199);
    doc.setLineWidth(0.5);
    doc.line(8, 15, 112, 15);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.text(`Name: ${patient.name}`, 8, 25);
    doc.text(`UMRN: ${patient.umrn}`, 8, 32);
    doc.text(`Blood Group: ${patient.bloodGroup}`, 8, 39);
    doc.text(`DOB: ${patient.dob}`, 8, 46);
    doc.text(`Gender: ${patient.gender}`, 8, 53);
    
    doc.setTextColor(225, 29, 72);
    doc.setFontSize(9);
    doc.text(`Emergency contact: ${patient.emergencyContact}`, 8, 65);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7);
    doc.text("Scan QR Code inside portal for trauma bay vitals access", 8, 77);

    // Save PDF
    doc.save(`${patient.name.replace(/\s+/g, '_')}_healthcard.pdf`);
  };

  // Book Appointment
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setBookingSuccess('');
    setBookingError('');
    try {
      const payload = {
        patientId: patient.id,
        doctorId: parseInt(bookingForm.doctorId),
        appointmentDate: bookingForm.appointmentDate,
        reason: bookingForm.reason
      };

      const res = await API.post('/appointments', payload);
      setAppointments(prev => [res.data, ...prev]);
      setBookingSuccess("Appointment scheduled successfully!");
      setBookingForm(prev => ({ ...prev, reason: '', appointmentDate: '' }));
      
      // Reload notifications
      const notifRes = await API.get(`/notifications/user/${patient.id}`);
      setNotifications(notifRes.data);
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to book appointment');
    }
  };

  // Cancel Appointment
  const handleCancelAppointment = async (apptId) => {
    try {
      await API.put(`/appointments/${apptId}/cancel`);
      setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, status: 'CANCELLED' } : a));
      
      // Reload notifications
      const notifRes = await API.get(`/notifications/user/${patient.id}`);
      setNotifications(notifRes.data);
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    }
  };

  // Search Availability
  const handleFinderSubmit = async (e) => {
    e.preventDefault();
    setFinderLoading(true);
    setFinderResult(null);
    try {
      const res = await API.get(
        `/hospitals/${finderForm.hospitalId}/check-availability?resource=${finderForm.resource}&query=${finderForm.query}&quantity=${finderForm.quantity}`
      );
      setFinderResult(res.data);
    } catch (err) {
      console.error("Error searching availability:", err);
    } finally {
      setFinderLoading(false);
    }
  };

  // Build the Universal Health Timeline (combines vaccinations, surgeries, and clinical records chronologically)
  const getTimelineItems = () => {
    const items = [];

    // Add medical records
    records.forEach(r => {
      items.push({
        date: r.visitDate,
        type: 'RECORD',
        title: `Clinical Visit: ${r.diagnosis}`,
        subtitle: `Treating facility: ${r.hospital?.name}`,
        details: r.doctorNotes || 'Consultation logs.',
        meds: r.prescription,
        reports: r.labReport,
        surgeries: r.operationNotes
      });
    });

    // Add surgeries
    if (patient.previousSurgeries) {
      patient.previousSurgeries.split(',').forEach(s => {
        items.push({
          date: 'Prior History',
          type: 'SURGERY',
          title: `Surgery: ${s.trim()}`,
          subtitle: 'Prior to portal registration',
          details: 'Patient-declared surgical history.'
        });
      });
    }

    // Add vaccinations
    if (patient.vaccinationHistory) {
      patient.vaccinationHistory.split(',').forEach(v => {
        items.push({
          date: 'Immunization Record',
          type: 'VACCINE',
          title: `Vaccine Dose: ${v.trim()}`,
          subtitle: 'Immunization Schedule',
          details: 'Administered under healthcare immunization guidelines.'
        });
      });
    }

    return items;
  };

  if (loading) {
    return (
      <div className="text-center my-5 py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Profile Details...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Banner */}
      <div className="glass-panel p-4 mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 text-start">
        <div>
          <h2 className="fw-bold m-0 text-primary">Patient Care Center</h2>
          <p className="text-muted m-0">UMRN: <strong className="text-primary">{patient?.umrn}</strong> | Blood Group: <strong>{patient?.bloodGroup}</strong></p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="d-flex gap-2 flex-wrap">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`btn d-flex align-items-center gap-2 px-3 py-2 border-0 ${activeTab === 'overview' ? 'btn-primary' : 'btn-light text-muted'}`}
          >
            <FiUser /> Overview
          </button>
          <button 
            onClick={() => setActiveTab('timeline')} 
            className={`btn d-flex align-items-center gap-2 px-3 py-2 border-0 ${activeTab === 'timeline' ? 'btn-primary' : 'btn-light text-muted'}`}
          >
            <FiActivity /> Health Timeline
          </button>
          <button 
            onClick={() => setActiveTab('appointments')} 
            className={`btn d-flex align-items-center gap-2 px-3 py-2 border-0 ${activeTab === 'appointments' ? 'btn-primary' : 'btn-light text-muted'}`}
          >
            <FiCalendar /> Appointments
          </button>
          <button 
            onClick={() => setActiveTab('finder')} 
            className={`btn d-flex align-items-center gap-2 px-3 py-2 border-0 ${activeTab === 'finder' ? 'btn-primary' : 'btn-light text-muted'}`}
          >
            <FiSearch /> Availability Finder
          </button>
        </div>
      </div>

      {activeTab === 'overview' && patient && (
        <div className="row g-4">
          {/* Identity column */}
          <div className="col-lg-5 text-center d-flex flex-column align-items-center">
            <div className="glass-panel p-4 w-100 mb-4 h-100 d-flex flex-column align-items-center justify-content-center">
              <h5 className="fw-bold mb-3 text-secondary text-start w-100 border-bottom pb-2">🏥 Digital Health Identity</h5>
              <HealthCard patient={patient} />
              
              <button onClick={handlePdfDownload} className="btn btn-outline-primary d-flex align-items-center gap-2 rounded-3 py-2 px-4 shadow-sm border mt-3 w-75 justify-content-center">
                <FiFileText /> Download Health Card PDF
              </button>
            </div>
          </div>

          {/* Details & Notifications */}
          <div className="col-lg-7 text-start">
            <div className="row g-4">
              {/* Notification Center */}
              <div className="col-12">
                <div className="glass-panel p-4" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  <h5 className="fw-bold mb-3 text-secondary d-flex align-items-center gap-2 border-bottom pb-2">
                    <FiBell /> Alerts & Reminders
                  </h5>
                  {notifications.length === 0 ? (
                    <p className="text-muted small">No active checkup or dose reminders.</p>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif.id} className="alert alert-light py-2 px-3 border border-secondary border-opacity-10 mb-2 rounded-3 text-muted" style={{ fontSize: '0.85rem' }}>
                        <span className="badge bg-primary bg-opacity-15 text-primary me-2">{notif.type}</span>
                        {notif.message}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Medicine Reminder Center */}
              <div className="col-12">
                <div className="glass-panel p-4">
                  <h5 className="fw-bold mb-3 text-secondary border-bottom pb-2">⏰ Medicine Reminders</h5>
                  <div className="p-3 bg-primary bg-opacity-5 rounded-3 border border-primary border-opacity-10">
                    <div className="fw-bold text-dark mb-1">Active Prescription Dosing</div>
                    {patient.currentMedications ? (
                      <div className="text-muted small" style={{ whiteSpace: 'pre-line' }}>{patient.currentMedications}</div>
                    ) : (
                      <p className="small text-muted mb-0">No active medication schedules recorded.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="glass-panel p-4 text-start">
          <h4 className="fw-bold text-primary mb-4 border-bottom pb-2">🩺 Universal Health Timeline</h4>
          
          <div className="timeline">
            {getTimelineItems().map((item, index) => (
              <div key={index} className="timeline-item">
                <div className="glass-card p-4">
                  <div className="d-flex justify-content-between align-items-start border-bottom pb-2 mb-2">
                    <div>
                      <h5 className="fw-bold text-primary m-0">{item.title}</h5>
                      <small className="text-muted fw-semibold">{item.subtitle}</small>
                    </div>
                    <span className={`badge ${item.type === 'RECORD' ? 'bg-primary' : item.type === 'SURGERY' ? 'bg-danger' : 'bg-success'}`}>
                      {item.type}
                    </span>
                  </div>
                  <p className="text-muted mb-2" style={{ fontSize: '0.9rem' }}>{item.details}</p>
                  {item.meds && (
                    <div className="mt-2 text-start">
                      <strong>💊 Prescribed:</strong> <span className="small text-muted">{item.meds}</span>
                    </div>
                  )}
                  {item.reports && (
                    <div className="mt-1 text-start">
                      <strong>🔬 Lab Reports:</strong> <span className="small text-muted">{item.reports}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="row g-4 text-start">
          {/* Schedule Form */}
          <div className="col-md-5">
            <div className="glass-panel p-4 h-100">
              <h5 className="fw-bold text-primary mb-3 border-bottom pb-2">📅 Schedule Consultation</h5>
              
              {bookingSuccess && <div className="alert alert-success py-2">✓ {bookingSuccess}</div>}
              {bookingError && <div className="alert alert-danger py-2">{bookingError}</div>}

              <form onSubmit={handleBookAppointment}>
                <div className="mb-3">
                  <label className="form-label text-secondary">Select Doctor</label>
                  <select 
                    className="form-select form-control-glass" 
                    value={bookingForm.doctorId}
                    onChange={(e) => setBookingForm({ ...bookingForm, doctorId: e.target.value })}
                    required
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.specialization} - {d.hospital?.name})</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label text-secondary">Date & Time</label>
                  <input 
                    type="datetime-local" 
                    className="form-control form-control-glass" 
                    value={bookingForm.appointmentDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, appointmentDate: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label text-secondary">Reason / Chief Complaint</label>
                  <textarea 
                    className="form-control form-control-glass" 
                    rows="3"
                    value={bookingForm.reason}
                    onChange={(e) => setBookingForm({ ...bookingForm, reason: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100 border-0 py-2 fw-semibold">
                  Confirm Booking
                </button>
              </form>
            </div>
          </div>

          {/* Appointments list */}
          <div className="col-md-7">
            <div className="glass-panel p-4 h-100">
              <h5 className="fw-bold text-primary mb-3 border-bottom pb-2">📋 Scheduled Visits</h5>
              
              <div className="table-responsive">
                <table className="table table-hover border-0">
                  <thead className="table-light">
                    <tr>
                      <th>Doctor</th>
                      <th>Date</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(appt => (
                      <tr key={appt.id}>
                        <td className="fw-bold">{appt.doctor?.name}</td>
                        <td>{new Date(appt.appointmentDate).toLocaleString()}</td>
                        <td>{appt.reason}</td>
                        <td>
                          <span className={`badge ${appt.status === 'SCHEDULED' ? 'bg-primary' : appt.status === 'COMPLETED' ? 'bg-success' : 'bg-danger'}`}>
                            {appt.status}
                          </span>
                        </td>
                        <td>
                          {appt.status === 'SCHEDULED' && (
                            <button 
                              className="btn btn-sm btn-outline-danger py-0.5 border"
                              onClick={() => handleCancelAppointment(appt.id)}
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {appointments.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center text-muted small">No scheduled visits.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'finder' && (
        <div className="glass-panel p-4 text-start">
          <h4 className="fw-bold text-primary mb-3 border-bottom pb-2">🔍 Hospital Availability Finder</h4>
          <p className="text-muted small mb-4">Check bed capacities, ICU slots, medical scanner diagnostics, or drug stocks. Suggester automatically lists nearby hospital alternatives if the primary facility is full.</p>

          <form onSubmit={handleFinderSubmit} className="row g-3">
            <div className="col-md-4">
              <label className="form-label text-secondary">Primary Hospital</label>
              <select 
                className="form-select form-control-glass" 
                value={finderForm.hospitalId}
                onChange={(e) => setFinderForm({ ...finderForm, hospitalId: e.target.value })}
                required
              >
                {hospitals.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
            
            <div className="col-md-3">
              <label className="form-label text-secondary">Resource Type</label>
              <select 
                className="form-select form-control-glass" 
                value={finderForm.resource}
                onChange={(e) => setFinderForm({ ...finderForm, resource: e.target.value, query: '' })}
                required
              >
                <option value="Bed">Hospital Beds</option>
                <option value="ICU">ICU Beds</option>
                <option value="MRI">MRI Scan</option>
                <option value="Doctor">Doctor Specialty</option>
                <option value="Medicine">Medicine Stock</option>
              </select>
            </div>

            {/* Sub queries */}
            {(finderForm.resource === 'Doctor' || finderForm.resource === 'Medicine') && (
              <div className="col-md-3">
                <label className="form-label text-secondary">
                  {finderForm.resource === 'Doctor' ? 'Specialization Roster' : 'Medicine Generic Name'}
                </label>
                <input 
                  type="text" 
                  className="form-control form-control-glass" 
                  placeholder={finderForm.resource === 'Doctor' ? 'e.g. Cardiology' : 'e.g. Metformin'}
                  value={finderForm.query}
                  onChange={(e) => setFinderForm({ ...finderForm, query: e.target.value })}
                  required
                />
              </div>
            )}

            {(finderForm.resource === 'Bed' || finderForm.resource === 'ICU' || finderForm.resource === 'Medicine') && (
              <div className="col-md-2">
                <label className="form-label text-secondary">Required Quantity</label>
                <input 
                  type="number" 
                  className="form-control form-control-glass" 
                  min="1"
                  value={finderForm.quantity}
                  onChange={(e) => setFinderForm({ ...finderForm, quantity: parseInt(e.target.value) })}
                  required
                />
              </div>
            )}

            <div className="col-12 mt-4 text-end">
              <button type="submit" className="btn btn-primary px-5 border-0" disabled={finderLoading}>
                {finderLoading ? 'Searching...' : 'Check Availability'}
              </button>
            </div>
          </form>

          {/* Results Panel */}
          {finderResult && (
            <div className="mt-5 p-4 rounded-3 border bg-white bg-opacity-60">
              {finderResult.available ? (
                <div className="alert alert-success d-flex align-items-center gap-2 mb-0">
                  <span className="fs-4">✓</span>
                  <div>
                    <h6 className="alert-heading fw-bold mb-1">Resource Available!</h6>
                    <span>The requested <strong>{finderResult.requestedResource}</strong> ({finderForm.resource === 'Doctor' || finderForm.resource === 'Medicine' ? finderForm.query : finderResult.requestedQuantity + ' slots'}) is in stock at <strong>{finderResult.primaryHospital?.name}</strong>.</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
                    <FiAlertTriangle className="fs-3 text-danger" />
                    <div>
                      <h6 className="alert-heading fw-bold mb-1">Resource Exhausted / Unavailable</h6>
                      <span>{finderResult.primaryHospital?.name} cannot fulfill this request at this time.</span>
                    </div>
                  </div>

                  <h5 className="fw-bold text-secondary mb-3">📍 Suggested Alternative Facilities:</h5>
                  {finderResult.suggestedAlternativeHospitals.length === 0 ? (
                    <p className="text-muted small">No other hospitals in the network currently report available slots for this resource.</p>
                  ) : (
                    <div className="row g-3">
                      {finderResult.suggestedAlternativeHospitals.map(h => (
                        <div key={h.id} className="col-md-6">
                          <div className="p-3 rounded-3 border bg-light">
                            <h6 className="fw-bold m-0 text-primary">{h.name}</h6>
                            <small className="text-muted d-block mb-2">{h.location}</small>
                            <div style={{ fontSize: '0.8rem' }} className="fw-semibold">
                              📞 Contact: {h.contact}
                            </div>
                            <span className="badge bg-success mt-2">
                              {finderForm.resource === 'Bed' ? `${h.availableBeds} beds` : finderForm.resource === 'ICU' ? `${h.availableIcu} ICU beds` : 'Resource available'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
