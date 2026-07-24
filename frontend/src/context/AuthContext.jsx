import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    const umrn = localStorage.getItem('umrn');
    const username = localStorage.getItem('username');

    if (token && role && name) {
      setUser({ token, role, name, umrn, username });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await API.post('/auth/login', { username, password });
      const { token, role, name, umrn } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('name', name);
      localStorage.setItem('username', username);
      if (umrn) {
        localStorage.setItem('umrn', umrn);
      } else {
        localStorage.removeItem('umrn');
      }

      setUser({ token, role, name, umrn, username });
      return { success: true, role };
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid credentials'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('umrn');
    localStorage.removeItem('username');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
