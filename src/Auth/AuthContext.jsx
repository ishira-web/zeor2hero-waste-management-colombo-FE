import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      setCurrentUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  async function login(email, password) {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const userData = await response.json();
      
      // Store token and user data
      localStorage.setItem('token', userData.token);
      localStorage.setItem('userData', JSON.stringify(userData));
      
      setCurrentUser(userData);
      setLoading(false);
      return { success: true, user: userData };
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setCurrentUser(null);
  }

  const value = {
    currentUser,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}