import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Form, Alert, Spinner } from 'react-bootstrap';
import { FaLock } from 'react-icons/fa';
import { useNotification } from '../../contexts/NotificationContext';
import AuthLayout from '../../components/layout/AuthLayout';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import apiClient from '../../api/apiClient';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get token and email from the URL query string
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      return setError("Passwords do not match.");
    }
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await apiClient.post('/reset-password', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation
      });
      showNotification('Password reset successfully! You can now login with the new password.', 'success');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center mb-4">
        <h2 className="fw-bold">ServeX</h2>
        <h4 className="text-muted">Set a New Password</h4>
        {email && <p className="text-muted mt-3">Your email address <strong>{email}</strong> has been verified. Please enter and confirm your new password below.</p>}
      </div>

      <Form onSubmit={handleSubmit}>
        {error && <Alert variant="danger">{error}</Alert>}
        {message && <Alert variant="success">{message}</Alert>}
        
        <FormField
          label="Password"
          type="password-toggle"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New Password"
          iconLeft={FaLock}
          required
        />
        
        <FormField
          label="Confirm Password"
          type="password-toggle"
          name="password_confirmation"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          placeholder="Confirm New Password"
          iconLeft={FaLock}
          required
        />

        <Button type="submit" className="w-100 mt-3" disabled={loading || !!message}>
          {loading ? <div className="text-center"><Spinner animation="border" variant="success" /></div> : 'Reset Password'}
        </Button>
      </Form>
    </AuthLayout>
  );
};

export default ResetPasswordPage;