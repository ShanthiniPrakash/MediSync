import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { FiAlertOctagon, FiSearch, FiPhoneCall, FiActivity, FiShield, FiHeart, FiFileText } from 'react-icons/fi';

const EmergencyDashboard = () => {
  const navigate = useNavigate();
  const [umrn, setUmrn] = useState('');
  const [reason, setReason] = useState('Critical Trauma / Unconscious Admit');
  const [doctorName, setDoctorName] = useState('Dr. Amit K. Sen');
  const [hospitalName, setHospitalName] = useState('MediSync Apex Hospital');
  
  // Vital Parameters for AI Triage
  const [spo2, setSpo2] = useState(98);
  const [gcs, setGcs] = useState(15);
  const [pulse, setPulse] = useState(72);
  const [bloodPressure, setBloodPressure] = useState('120/80');
  const [temperature, setTemperature] = useState(98.6);
  const [respiratoryRate, setRespiratoryRate] = useState(16);
  const [bloodSugar, setBloodSugar] = useState(100);

  const [triageResult, setTriageResult] = useState(null);
  const [profile, setProfile] = useState(null);
  const [latestRecord, setLatestRecord] = useState(null);
  const [logs, setLogs] = useState([]);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await API.get('/emergency/logs');
      setLogs(res.data);
    } catch (error) {
      console.error("Error loading emergency logs:", error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [profile]);

  const handleLookup = async (e) => {
    if (e) e.preventDefault();
    if (!umrn.trim()) return;

    setErrorMsg('');
    setLoading(true);
    setProfile(null);
    setLatestRecord(null);
    setTriageResult(null);

    try {
      // 1. Fetch Emergency demographics & trigger log
      const res = await API.get(`/emergency/${umrn}?reason=${reason}&doctor=${doctorName}&hospital=${hospitalName}`);
      setProfile(res.data);

      // 2. Fetch latest prescriptions & clinical record
      const recordRes = await API.get(`/medical-records/${umrn}`);
      if (recordRes.data.length > 0) {
        setLatestRecord(recordRes.data[0]);
      }

      // 3. Call AI Emergency Prioritization API
      const triageRes = await API.post('/api/ai/emergency-priority', {
        bloodPressure,
        pulse: parseInt(pulse),
        temperature: parseFloat(temperature),
        respiratoryRate: parseInt(respiratoryRate),
        spo2: parseInt(spo2),
        gcs: parseInt(gcs),
        bloodSugar: parseInt(bloodSugar)
      });
      setTriageResult(triageRes.data);
      
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Emergency profile not found for this UMRN');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLookup = () => {
    setUmrn('UMRN100000000001');
    setReason('Trauma Bay Simulated Admit');
    setDoctorName('Dr. Sunita Rao');
    setHospitalName('MediSync Apex Hospital');
    setSpo2(88); // Trigger CRITICAL/RED triage
    setGcs(7);   // Trigger CRITICAL/RED triage
    setPulse(135);
    setBloodPressure('90/60');
    
    setTimeout(() => {
      handleLookup();
    }, 200);
  };

  return (
    <div className="emergency-theme min-vh-100 p-4 text-white">
      {/* Top Bar */}
      <div className="container-fluid mb-5 d-flex justify-content-between align-items-center">
        <h3 className="fw-bold m-0 d-flex align-items-center gap-2 text-white">
          <FiAlertOctagon className="text-danger emergency-pulse" />
          <span>MEDISYNC EMERGENCY SMART DESK</span>
        </h3>
        
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-light btn-sm"
            onClick={() => setShowLogs(!showLogs)}
          >
            {showLogs ? 'Hide Access Logs' : 'View Audit Logs'}
          </button>
          <button 
            className="btn btn-light btn-sm fw-bold"
            onClick={() => navigate('/')}
          >
            Go to Portal Login
          </button>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '1000px' }}>
        
        {/* Search Panel */}
        <div className="glass-panel p-4 mb-5 border-danger border-opacity-50 text-start" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <h4 className="fw-bold mb-3 d-flex align-items-center gap-2 text-danger">
            🚨 CRITICAL MEDICAL DECRYPT & AI TRIAGE
          </h4>
          <p className="small opacity-75">
            This module decrypts medical profiles immediately, assesses incoming patient vitals, and logs auditor details for audit logs.
          </p>

          <form onSubmit={handleLookup} className="row g-3 mt-2">
            <div className="col-md-3">
              <label className="form-label small fw-bold text-white-50">Patient UMRN</label>
              <input 
                type="text" 
                className="form-control bg-dark border-0 text-white" 
                placeholder="e.g. UMRN100000000001"
                value={umrn}
                onChange={(e) => setUmrn(e.target.value)}
                style={{ boxShadow: 'none' }}
                required
              />
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-bold text-white-50">Doctor Name (Audited)</label>
              <input 
                type="text" 
                className="form-control bg-dark border-0 text-white" 
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                style={{ boxShadow: 'none' }}
                required
              />
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-bold text-white-50">Hospital Name (Audited)</label>
              <input 
                type="text" 
                className="form-control bg-dark border-0 text-white" 
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                style={{ boxShadow: 'none' }}
                required
              />
            </div>
            
            <div className="col-md-3">
              <label className="form-label small fw-bold text-white-50">Reason for Access</label>
              <input 
                type="text" 
                className="form-control bg-dark border-0 text-white" 
                placeholder="e.g. Trauma bay admit"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{ boxShadow: 'none' }}
              />
            </div>

            {/* Vital Parameters sub section */}
            <div className="col-12 mt-3 pt-3 border-top border-secondary border-opacity-20">
              <h6 className="fw-bold text-warning mb-3">📍 Patient Vitals Input for AI Emergency Prioritization:</h6>
              <div className="row g-2">
                <div className="col-6 col-md-2">
                  <label className="small text-white-50 mb-1">SpO2 (%)</label>
                  <input type="number" className="form-control form-control-sm bg-dark border-0 text-white" value={spo2} onChange={e => setSpo2(e.target.value)} />
                </div>
                <div className="col-6 col-md-2">
                  <label className="small text-white-50 mb-1">Glasgow (GCS)</label>
                  <input type="number" className="form-control form-control-sm bg-dark border-0 text-white" min="3" max="15" value={gcs} onChange={e => setGcs(e.target.value)} />
                </div>
                <div className="col-6 col-md-2">
                  <label className="small text-white-50 mb-1">BP (systolic/diastolic)</label>
                  <input type="text" className="form-control form-control-sm bg-dark border-0 text-white" value={bloodPressure} onChange={e => setBloodPressure(e.target.value)} />
                </div>
                <div className="col-6 col-md-2">
                  <label className="small text-white-50 mb-1">Pulse (bpm)</label>
                  <input type="number" className="form-control form-control-sm bg-dark border-0 text-white" value={pulse} onChange={e => setPulse(e.target.value)} />
                </div>
                <div className="col-6 col-md-2">
                  <label className="small text-white-50 mb-1">Resp Rate (c/m)</label>
                  <input type="number" className="form-control form-control-sm bg-dark border-0 text-white" value={respiratoryRate} onChange={e => setRespiratoryRate(e.target.value)} />
                </div>
                <div className="col-6 col-md-2">
                  <label className="small text-white-50 mb-1">Blood Sugar (mg/dL)</label>
                  <input type="number" className="form-control form-control-sm bg-dark border-0 text-white" value={bloodSugar} onChange={e => setBloodSugar(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="col-12 d-flex flex-wrap gap-2 mt-4 justify-content-between align-items-center">
              <button 
                type="button" 
                className="btn btn-outline-warning btn-sm"
                onClick={handleDemoLookup}
              >
                ⚡ Fast Demo Load (Critical Triage)
              </button>

              <button 
                type="submit" 
                className="btn btn-danger px-5 fw-bold border-0"
                disabled={loading}
              >
                {loading ? 'Decrypting & Triaging...' : 'DECRYPT RECORD'}
              </button>
            </div>
          </form>

          {errorMsg && (
            <div className="alert alert-danger mt-3 py-2 bg-danger bg-opacity-20 border-danger text-white text-center">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Display Critical Emergency Profile */}
        {profile && (
          <div className="card border-danger border-2 mb-5 overflow-hidden shadow-lg" style={{ background: 'rgba(28,2,2,0.9)' }}>
            
            {/* Alert Banner + Triage Badge */}
            <div className="bg-danger text-white p-3 d-flex justify-content-between align-items-center">
              <span className="fw-bold d-flex align-items-center gap-2 fs-5">
                <FiAlertOctagon className="emergency-pulse" /> DECRYPTED EMERGENCY VITAL SHEET
              </span>
              
              {triageResult && (
                <span className={`badge px-3 py-2 fw-bold text-uppercase fs-6 shadow-sm border border-white border-opacity-25 ${
                  triageResult.colorCode === 'RED' ? 'bg-dark text-danger' : 
                  triageResult.colorCode === 'ORANGE' ? 'bg-warning text-dark' : 'bg-success text-white'
                }`}>
                  🚨 AI Triage: {triageResult.classification}
                </span>
              )}
            </div>

            <div className="card-body p-4 text-start">
              
              {/* Triage Reason explanation */}
              {triageResult && (
                <div className="alert bg-black bg-opacity-25 border border-white border-opacity-10 py-2 px-3 mb-4 rounded text-white small">
                  <strong>AI Priority Reason:</strong> {triageResult.reason}
                </div>
              )}

              {/* Primary Vitals Grid */}
              <div className="row g-4 border-bottom border-secondary border-opacity-25 pb-4 mb-4">
                <div className="col-md-3">
                  <span className="text-white-50 small d-block">PATIENT FULL NAME</span>
                  <strong className="fs-4 text-white">{profile.name}</strong>
                </div>
                <div className="col-md-3">
                  <span className="text-white-50 small d-block">AGE</span>
                  <strong className="fs-4 text-white">{profile.age} yrs</strong>
                </div>
                <div className="col-md-3">
                  <span className="text-white-50 small d-block">BLOOD GROUP</span>
                  <strong className="fs-3 text-warning">{profile.bloodGroup}</strong>
                </div>
                <div className="col-md-3">
                  <span className="text-white-50 small d-block">EMERGENCY NEXT-OF-KIN</span>
                  <strong className="fs-5 text-danger d-flex align-items-center gap-2">
                    <FiPhoneCall /> {profile.emergencyContact}
                  </strong>
                </div>
              </div>

              {/* Critical Alert Details */}
              <div className="row g-4 border-bottom border-secondary border-opacity-25 pb-4 mb-4">
                <div className="col-md-6">
                  <div className="p-3 rounded bg-danger bg-opacity-10 border border-danger border-opacity-25 h-100">
                    <h6 className="fw-bold text-danger d-flex align-items-center gap-2 mb-2">
                      ❌ KNOWN DRUG/FOOD ALLERGIES
                    </h6>
                    <p className="m-0 fw-semibold text-white">
                      {profile.allergies || 'No Known Allergies'}
                    </p>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="p-3 rounded bg-danger bg-opacity-10 border border-danger border-opacity-25 h-100">
                    <h6 className="fw-bold text-danger d-flex align-items-center gap-2 mb-2">
                      ⚠️ CHRONIC MEDICAL CONDITIONS
                    </h6>
                    <p className="m-0 fw-semibold text-white">
                      {profile.chronicDiseases || 'None Recorded'}
                    </p>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="p-3 rounded bg-secondary bg-opacity-10 border border-secondary border-opacity-25 h-100">
                    <h6 className="fw-bold text-white d-flex align-items-center gap-2 mb-2">
                      💊 ACTIVE MEDICATIONS
                    </h6>
                    <p className="m-0 opacity-90 text-white">
                      {profile.currentMedications || 'None'}
                    </p>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="p-3 rounded bg-secondary bg-opacity-10 border border-secondary border-opacity-25 h-100">
                    <h6 className="fw-bold text-white mb-2">✂️ PAST SURGERIES</h6>
                    <p className="m-0 opacity-90 text-white">
                      {profile.previousSurgeries || 'None'}
                    </p>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="p-3 rounded bg-secondary bg-opacity-10 border border-secondary border-opacity-25 h-100">
                    <h6 className="fw-bold text-white mb-2">🛡️ INSURANCE CODE</h6>
                    <p className="m-0 opacity-90 text-white">
                      {profile.insuranceDetails || 'INS-9928374'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Latest prescriptions & lab reports */}
              {latestRecord && (
                <div className="row g-4">
                  <div className="col-md-6">
                    <h6 className="fw-bold text-warning mb-2">💊 LATEST CHECKUP PRESCRIPTIONS</h6>
                    <div className="bg-light bg-opacity-10 p-3 rounded text-white small" style={{ whiteSpace: 'pre-line' }}>
                      {latestRecord.prescription || 'No active drug prescriptions.'}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-bold text-warning mb-2">🔬 RECENT LAB DIAGNOSTICS</h6>
                    <div className="bg-light bg-opacity-10 p-3 rounded text-white small" style={{ whiteSpace: 'pre-line' }}>
                      {latestRecord.labReport || 'No diagnostic lab results recorded.'}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Audit Logs Table */}
        {showLogs && (
          <div className="glass-panel p-4 text-start border-light border-opacity-20 text-white mb-5" style={{ background: 'rgba(0,0,0,0.4)' }}>
            <h5 className="fw-bold mb-3 text-warning">🛡️ Emergency Portal Audit Trail</h5>
            <p className="small opacity-75">
              Logs of all emergency lookup transactions compiled for compliance monitoring.
            </p>
            
            <div className="table-responsive">
              <table className="table table-dark table-hover table-borderless align-middle" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr className="text-white-50 border-bottom border-secondary">
                    <th>Accessed By</th>
                    <th>Doctor Name</th>
                    <th>Patient UMRN</th>
                    <th>Access Time</th>
                    <th>Reason Given</th>
                    <th>Facility</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="fw-bold text-warning">{log.accessedByUsername}</td>
                      <td>{log.doctorName || 'Dr. Consultant'}</td>
                      <td>{log.patientUmrn}</td>
                      <td>{new Date(log.accessTime).toLocaleString()}</td>
                      <td>{log.reason}</td>
                      <td>{log.hospitalName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default EmergencyDashboard;
