import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FiLogOut, FiAlertTriangle, FiUser } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light glass-panel m-3 p-3">
      <div className="container-fluid p-0">
        <Link className="navbar-brand fw-bold text-primary d-flex align-items-center gap-2" to="/">
          <span className="fs-3">🏥</span> MediSync
        </Link>
        
        <div className="d-flex align-items-center gap-3 ms-auto">
          {/* Quick-Access Emergency Portal Button */}
          <Link to="/emergency-portal" className="btn btn-danger d-flex align-items-center gap-2 px-3 emergency-pulse border-0">
            <FiAlertTriangle />
            <span className="d-none d-md-inline fw-semibold">Emergency Access</span>
          </Link>

          <div className="d-flex align-items-center gap-2 bg-white bg-opacity-50 px-3 py-2 rounded-3 border border-white">
            <FiUser className="text-primary" />
            <span className="fw-semibold text-dark d-none d-sm-inline">{user?.name}</span>
            <span className="badge bg-primary bg-opacity-25 text-primary ms-1" style={{ fontSize: '0.75rem' }}>
              {user?.role === 'ROLE_ADMIN' ? 'Admin' : 'Patient'}
            </span>
          </div>

          <button onClick={handleLogout} className="btn btn-glass-danger d-flex align-items-center gap-2 rounded-3 px-3">
            <FiLogOut />
            <span className="d-none d-lg-inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
