import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Alert, Spinner } from 'react-bootstrap';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import BackButton from '../../components/common/BackButton';
import AuthLayout from '../../components/layout/AuthLayout';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import apiClient from '../../api/apiClient';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await apiClient.post('/forgot-password', { email });
      setMessage('A password reset link has been sent.');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <>
        <BackButton to={`/login`} place="Login"></BackButton>
    </>
);

  return (
    <AuthLayout footer={footer}>
      <div className="text-center mb-4">
        <h2 className="fw-bold">ServeX</h2>
        <h4 className="text-muted">Forgot Your Password?</h4>
        <p className="text-muted mt-3">
          Don't worry. Enter the email address associated with your account, and we will send you a link to reset your password.
        </p>
      </div>

      <Form onSubmit={handleSubmit}>
        {error && <Alert variant="danger">{error}</Alert>}
        {message && <Alert variant="success">{message}</Alert>}
        
        <FormField
          label="Email Address"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          icon={FaEnvelope}
          required
        />

        <Button type="submit" className="w-100 mt-3" disabled={loading}>
          {loading ? <div className="text-center"><Spinner animation="border" variant="success" /></div> : 'Send Reset Link'}
        </Button>
      </Form>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;