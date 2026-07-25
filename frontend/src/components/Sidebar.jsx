import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiGrid, FiShield, FiHeart } from 'react-icons/fi';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isPharmacy = user?.role === 'ROLE_PHARMACY';

  return (
    <div className="sidebar d-none d-md-flex flex-column p-3 gap-2">
      <div className="text-center py-4">
        <div className="fs-2 mb-1">🛡️</div>
        <h5 className="fw-bold text-primary m-0">MediSync Portal</h5>
        <small className="text-muted fw-semibold">Unified Multi-Hospital</small>
      </div>

      <hr className="bg-secondary bg-opacity-25 mx-2 my-1" />

      <div className="nav nav-pills flex-column gap-2 mt-3">
        {isAdmin ? (
          <>
            <NavLink to="/admin/dashboard" className="nav-link">
              <FiGrid size={18} />
              <span>Admin Dashboard</span>
            </NavLink>
            <NavLink to="/emergency-portal" className="nav-link text-danger" style={({ isActive }) => isActive ? { background: 'var(--emergency-color)', color: '#fff' } : {}}>
              <FiShield size={18} />
              <span>Emergency Portal</span>
            </NavLink>
          </>
        ) : isPharmacy ? (
          <>
            <NavLink to="/pharmacy/dashboard" className="nav-link">
              <FiGrid size={18} />
              <span>Pharmacy Dashboard</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/patient/dashboard" className="nav-link">
              <FiGrid size={18} />
              <span>Patient Dashboard</span>
            </NavLink>
          </>
        )}
      </div>

      <div className="mt-auto p-3 text-center rounded-3 bg-white bg-opacity-20 border border-white">
        <FiHeart className="text-danger mb-2" size={24} />
        <div style={{ fontSize: '0.85rem' }} className="fw-semibold text-secondary">
          Your health records, synchronized.
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
