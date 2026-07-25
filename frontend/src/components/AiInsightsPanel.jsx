import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { FiCpu, FiAlertTriangle, FiCheckCircle, FiShield, FiActivity, FiLayers, FiList, FiPlus } from 'react-icons/fi';

const AiInsightsPanel = ({ umrn, patientId }) => {
  const [summary, setSummary] = useState(null);
  const [risks, setRisks] = useState(null);
  const [loading, setLoading] = useState(true);

  // Drug Check states
  const [medsInput, setMedsInput] = useState('');
  const [drugCheckResult, setDrugCheckResult] = useState(null);
  const [checkingDrugs, setCheckingDrugs] = useState(false);

  // Recommendations states
  const [diagnosis, setDiagnosis] = useState('Acute Bronchitis');
  const [symptoms, setSymptoms] = useState('Productive cough, chest congestion, low-grade fever');
  const [recommendation, setRecommendation] = useState(null);
  const [generatingRec, setGeneratingRec] = useState(false);

  const fetchAiData = async () => {
    try {
      setLoading(true);
      const [sumRes, riskRes] = await Promise.all([
        API.get(`/api/ai/patient/${umrn}/summary`),
        API.get(`/api/ai/patient/${umrn}/risk`)
      ]);
      setSummary(sumRes.data);
      setRisks(riskRes.data);
    } catch (error) {
      console.error("Error loading AI CDSS insights:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (umrn) {
      fetchAiData();
    }
  }, [umrn]);

  const handleDrugCheck = async (e) => {
    e.preventDefault();
    if (!medsInput.trim()) return;
    setCheckingDrugs(true);
    setDrugCheckResult(null);

    const list = medsInput.split(',').map(m => m.trim()).filter(m => m.length > 0);
    try {
      const res = await API.post('/api/ai/drug-check', {
        patientUmrn: umrn,
        prescribedMedicines: list
      });
      setDrugCheckResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingDrugs(false);
    }
  };

  const handleRecommendation = async (e) => {
    e.preventDefault();
    setGeneratingRec(true);
    setRecommendation(null);
    try {
      const res = await API.post('/api/ai/recommendation', {
        patientUmrn: umrn,
        diagnosis,
        symptoms
      });
      setRecommendation(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingRec(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary spinner-border-sm" role="status">
          <span className="visually-hidden">Analyzing Longitudinal Records...</span>
        </div>
        <div className="small text-muted mt-2 fw-semibold">AI Clinical Inference Engine is analyzing patient history...</div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="d-flex align-items-center gap-2 mb-3 border-bottom pb-2">
        <FiCpu className="text-primary fs-4" />
        <h4 className="fw-bold m-0 text-primary">MediSync AI Clinical Decision Support (CDSS)</h4>
      </div>

      {/* AI Longitudinal Summary */}
      {summary && (
        <div className="alert alert-primary bg-primary bg-opacity-5 border border-primary border-opacity-20 rounded-3 p-4 mb-4 text-start">
          <h6 className="fw-bold text-primary mb-2 d-flex align-items-center gap-2">
            🤖 AI Longitudinal Case Summary
          </h6>
          <p className="m-0 text-dark small" style={{ lineHeight: '1.6' }}>{summary.summaryText}</p>
          {summary.keyHighlights?.length > 0 && (
            <div className="mt-3">
              <span className="small fw-bold text-secondary d-block mb-1">Critical Highlights:</span>
              {summary.keyHighlights.map((hl, idx) => (
                <div key={idx} className="small text-danger fw-semibold d-flex align-items-center gap-1">
                  • {hl}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="row g-4">
        {/* Disease Risk Predictions */}
        <div className="col-md-6 text-start">
          <div className="glass-panel p-4 h-100">
            <h5 className="fw-bold text-secondary mb-3 d-flex align-items-center gap-2">
              <FiActivity className="text-danger" /> Predictive Disease Risk Scoring
            </h5>
            {risks && risks.riskPercentages && (
              <div className="d-flex flex-column gap-3">
                {Object.entries(risks.riskPercentages).map(([type, pct]) => {
                  const level = risks.riskLevels[type];
                  const exp = risks.explanations[type];
                  const color = level === 'HIGH' ? 'bg-danger' : level === 'MEDIUM' ? 'bg-warning' : 'bg-success';
                  
                  return (
                    <div key={type} className="p-2 border rounded bg-light bg-opacity-40">
                      <div className="d-flex justify-content-between mb-1">
                        <strong className="small text-dark">{type.replace('_', ' ')} RISK</strong>
                        <span className={`badge ${level === 'HIGH' ? 'bg-danger' : level === 'MEDIUM' ? 'bg-warning text-dark' : 'bg-success'}`}>
                          {level} ({pct.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="progress mb-2" style={{ height: '8px' }}>
                        <div 
                          className={`progress-bar ${color}`} 
                          role="progressbar" 
                          style={{ width: `${pct}%` }} 
                          aria-valuenow={pct} 
                          aria-valuemin="0" 
                          aria-valuemax="100"
                        ></div>
                      </div>
                      <small className="text-muted" style={{ fontSize: '0.75rem' }}>{exp}</small>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Drug Interaction Auditor */}
        <div className="col-md-6 text-start">
          <div className="glass-panel p-4 h-100">
            <h5 className="fw-bold text-secondary mb-3 d-flex align-items-center gap-2">
              <FiShield className="text-success" /> Drug Safety & Allergen Auditor
            </h5>
            
            <form onSubmit={handleDrugCheck} className="mb-3">
              <label className="form-label text-secondary small fw-bold">Enter proposed prescriptions (comma separated)</label>
              <div className="input-group">
                <input 
                  type="text" 
                  className="form-control form-control-glass small" 
                  placeholder="e.g. Amoxicillin, Aspirin"
                  value={medsInput}
                  onChange={e => setMedsInput(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary border-0 btn-sm px-3" disabled={checkingDrugs}>
                  {checkingDrugs ? 'Checking...' : 'Audit Prescriptions'}
                </button>
              </div>
            </form>

            {drugCheckResult && (
              <div className="p-3 rounded bg-white bg-opacity-65 border">
                {drugCheckResult.safe ? (
                  <div className="alert alert-success d-flex align-items-center gap-2 mb-0 py-2 small">
                    <FiCheckCircle className="text-success fs-5" />
                    <span>Prescriptions verified. No active contraindications or allergen matches.</span>
                  </div>
                ) : (
                  <div>
                    {drugCheckResult.warnings?.map((w, idx) => (
                      <div key={idx} className="alert alert-danger py-2 px-3 mb-2 rounded-3 text-start small border-danger border-opacity-10 d-flex align-items-start gap-2">
                        <FiAlertTriangle className="text-danger mt-1 flex-shrink-0" size={16} />
                        <span>{w}</span>
                      </div>
                    ))}
                    {drugCheckResult.alternatives?.length > 0 && (
                      <div className="mt-2 p-2 bg-success bg-opacity-5 rounded border border-success border-opacity-15">
                        <strong className="text-success small d-block">Suggested Safer Alternatives:</strong>
                        {drugCheckResult.alternatives.map((alt, idx) => (
                          <div key={idx} className="small text-muted mb-1">• {alt}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Treatment Recommendation Guide */}
        <div className="col-12 text-start mt-4">
          <div className="glass-panel p-4">
            <h5 className="fw-bold text-secondary mb-3 d-flex align-items-center gap-2">
              <FiLayers className="text-primary" /> Guidelines-based Recommendation Generator
            </h5>

            <form onSubmit={handleRecommendation} className="row g-3">
              <div className="col-md-6">
                <label className="form-label text-secondary small">Diagnosis Context</label>
                <select 
                  className="form-select form-control-glass text-dark" 
                  value={diagnosis} 
                  onChange={e => setDiagnosis(e.target.value)}
                >
                  <option value="Acute Bronchitis">Acute Bronchitis</option>
                  <option value="Asthma Exacerbation">Asthma Exacerbation</option>
                  <option value="Hypertension Crisis">Hypertension Crisis</option>
                  <option value="General Checkup">General / Routine Checkup</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label text-secondary small">Presenting Symptoms</label>
                <input 
                  type="text" 
                  className="form-control form-control-glass text-dark" 
                  value={symptoms} 
                  onChange={e => setSymptoms(e.target.value)}
                />
              </div>
              <div className="col-12 text-end">
                <button type="submit" className="btn btn-outline-primary border btn-sm" disabled={generatingRec}>
                  {generatingRec ? 'Analyzing...' : 'Generate Treatment Guidelines'}
                </button>
              </div>
            </form>

            {recommendation && (
              <div className="mt-4 p-3 bg-light bg-opacity-70 rounded border">
                <div className="row g-3">
                  <div className="col-md-6">
                    <strong className="text-primary small d-block mb-1">💊 Recommended Medicines:</strong>
                    <div className="bg-white p-2 rounded small text-muted" style={{ whiteSpace: 'pre-line' }}>
                      {recommendation.suggestedMedicines}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <strong className="text-primary small d-block mb-1">🔬 Recommended Diagnostics:</strong>
                    <div className="bg-white p-2 rounded small text-muted" style={{ whiteSpace: 'pre-line' }}>
                      {recommendation.suggestedTests}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <strong className="text-primary small d-block mb-1">🥗 Lifestyle Modifications:</strong>
                    <div className="bg-white p-2 rounded small text-muted" style={{ whiteSpace: 'pre-line' }}>
                      {recommendation.lifestyleAdvice}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <strong className="text-primary small d-block mb-1">📅 Recommended Follow-up:</strong>
                    <div className="bg-white p-2 rounded small text-muted">
                      Review in <strong>{recommendation.followUpDays} days</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiInsightsPanel;
