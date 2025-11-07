import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import RegistrationForm from './RegistrationForm';
import apiClient from '../../api/apiClient';

const PlayerRegistrationPage = () => {
  const navigate = useNavigate();

  const handlePlayerSubmit = async (formData) => {
    const data = new FormData();
    for (const key in formData) {
      if (key === 'photo' && !formData[key]) {
        continue;
      }
      data.append(key, formData[key]);
    }
    
    const response = await apiClient.post('/register/player', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    // Navigate to Login Page
    navigate('/login');
  };

  const registerFooter = (
    <>
        <p>Already have an account? <Link to="/login" className="text-decoration-none fw-semibold" style={{ color: 'var(--servex-green)' }}>Login</Link></p>
    </>
);

  return (
    <AuthLayout size="large" footer={registerFooter}>
      <RegistrationForm 
        role="Player"
        title="Create Your Player Account"
        submitHandler={handlePlayerSubmit}
      />
    </AuthLayout>
  );
};

export default PlayerRegistrationPage;