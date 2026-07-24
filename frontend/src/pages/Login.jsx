import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiLock, FiUser, FiAlertTriangle } from 'react-icons/fi';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [roleMode, setRoleMode] = useState('ADMIN'); // 'ADMIN', 'PATIENT', 'PHARMACY'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  const handleDemoFill = (type) => {
    if (type === 'ADMIN') {
      setUsername('admin@medisync.com');
      setPassword('admin123');
      setRoleMode('ADMIN');
    } else if (type === 'PHARMACY') {
      setUsername('pharmacy@medisync.com');
      setPassword('pharmacy123');
      setRoleMode('PHARMACY');
    } else {
      setUsername('UMRN100000000001');
      setPassword('15081995');
      setRoleMode('PATIENT');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="glass-panel p-5 shadow-lg w-100" style={{ maxWidth: '480px', border: '1px solid rgba(255,255,255,0.7)' }}>
        
        {/* Logo/Header */}
        <div className="text-center mb-4">
          <div className="display-4 text-primary mb-2">🏥</div>
          <h2 className="fw-bold text-primary m-0">MediSync</h2>
          <p className="text-muted fw-semibold">Unified Hospital Management Platform</p>
        </div>

        {/* Emergency Shortcut Banner */}
        <div className="alert alert-danger bg-danger bg-opacity-10 border-danger border-opacity-25 rounded-3 d-flex align-items-start gap-3 mb-4 p-3 text-dark text-start">
          <FiAlertTriangle className="text-danger mt-1 flex-shrink-0" size={20} />
          <div>
            <h6 className="alert-heading fw-bold text-danger mb-1">Emergency Access Desk</h6>
            <p className="small m-0 text-muted">
              Access critical patient files instantly by scanning QR or searching UMRN.
            </p>
            <Link to="/emergency-portal" className="btn btn-sm btn-danger mt-2 fw-semibold border-0">
              Access Portal Now
            </Link>
          </div>
        </div>

        {/* Role Toggle Tabs */}
        <div className="d-flex justify-content-center gap-1 mb-4">
          <button 
            type="button" 
            className={`btn py-2 fw-bold ${roleMode === 'ADMIN' ? 'btn-primary' : 'btn-light text-muted'}`}
            onClick={() => { setRoleMode('ADMIN'); setError(''); }}
            style={{ fontSize: '0.75rem', flex: 1 }}
          >
            Admin
          </button>
          <button 
            type="button" 
            className={`btn py-2 fw-bold ${roleMode === 'PHARMACY' ? 'btn-primary' : 'btn-light text-muted'}`}
            onClick={() => { setRoleMode('PHARMACY'); setError(''); }}
            style={{ fontSize: '0.75rem', flex: 1 }}
          >
            Pharmacy
          </button>
          <button 
            type="button" 
            className={`btn py-2 fw-bold ${roleMode === 'PATIENT' ? 'btn-primary' : 'btn-light text-muted'}`}
            onClick={() => { setRoleMode('PATIENT'); setError(''); }}
            style={{ fontSize: '0.75rem', flex: 1 }}
          >
            Patient
          </button>
        </div>

        {error && (
          <div className="alert alert-danger py-2 rounded-3 text-center small mb-3">
            ❌ {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3 text-start">
            <label className="form-label fw-bold small text-secondary">
              {roleMode === 'ADMIN' ? 'Email Address' : roleMode === 'PHARMACY' ? 'Pharmacy Email' : 'Universal Medical Record Number (UMRN)'}
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <FiUser />
              </span>
              <input 
                type="text" 
                className="form-control form-control-glass border-start-0" 
                placeholder={roleMode === 'ADMIN' ? 'admin@medisync.com' : roleMode === 'PHARMACY' ? 'pharmacy@medisync.com' : 'e.g. UMRN100000000001'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4 text-start">
            <label className="form-label fw-bold small text-secondary">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <FiLock />
              </span>
              <input 
                type="password" 
                className="form-control form-control-glass border-start-0" 
                placeholder={roleMode === 'ADMIN' ? 'admin123' : roleMode === 'PHARMACY' ? 'pharmacy123' : 'DOB in ddMMyyyy (e.g. 15081995)'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {roleMode === 'PATIENT' && (
              <div className="form-text small text-muted text-start mt-1">
                * Note: Password is your Date of Birth in <strong>ddMMyyyy</strong> format.
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-100 py-2 fw-bold shadow-sm rounded-3 d-flex align-items-center justify-content-center gap-2 border-0"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="mt-4 p-3 bg-light bg-opacity-50 rounded-3 border text-center" style={{ fontSize: '0.8rem' }}>
          <div className="fw-bold text-secondary mb-2">💡 HACKATHON DEMO SUGGESTIONS</div>
          <div className="d-flex justify-content-center gap-2 flex-wrap">
            <button 
              type="button" 
              className="btn btn-sm btn-outline-primary py-1 px-2 border"
              onClick={() => handleDemoFill('ADMIN')}
              style={{ fontSize: '0.75rem' }}
            >
              Fill Admin
            </button>
            <button 
              type="button" 
              className="btn btn-sm btn-outline-primary py-1 px-2 border"
              onClick={() => handleDemoFill('PHARMACY')}
              style={{ fontSize: '0.75rem' }}
            >
              Fill Pharmacy
            </button>
            <button 
              type="button" 
              className="btn btn-sm btn-outline-primary py-1 px-2 border"
              onClick={() => handleDemoFill('PATIENT')}
              style={{ fontSize: '0.75rem' }}
            >
              Fill Patient
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
