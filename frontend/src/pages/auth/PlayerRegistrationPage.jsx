import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import RegistrationForm from './RegistrationForm';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/apiClient';

const PlayerRegistrationPage = () => {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuth();

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

    // Login automatically after successful registration
    setUser(response.data.user);
    setToken(response.data.token);
    navigate('/');
  };

  const registerFooter = (
    <>
        <p>Already have an account? <Link to="/login">Login</Link></p>
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