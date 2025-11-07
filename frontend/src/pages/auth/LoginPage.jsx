import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Alert, Spinner } from 'react-bootstrap';
import { FaEnvelope, FaLock } from 'react-icons/fa';

import AuthLayout from '../../components/layout/AuthLayout';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loginFooter = (
    <>
        <p className="text-muted">Don't have an account?</p>
        <Link to="/register/player" className="sign-up-link mx-2">Sign up as Player</Link>
        <span className="text-muted mx-3">|</span>
        <Link to="/register/owner" className="sign-up-link mx-2">Sign up as Owner</Link>
    </>
  );

  return (
    <AuthLayout footer={loginFooter}>
      <div className="text-center mb-5">
        <h2 className="fw-bold">ServeX</h2>
        <h4 className="text-muted fw-semibold">Welcome Back!</h4>
      </div>

      <Form onSubmit={handleSubmit}>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <FormField
          label="Email Address"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          iconLeft={FaEnvelope}
          required
        />
        
        <FormField
          label="Password"
          type="password-toggle"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          iconLeft={FaLock}
          required
        />
        
        <div className="text-end mb-4">
          <Link to="/forgot-password" className="forgot-password">Forgot Password?</Link>
        </div>

        <Button type="submit" className="w-100" disabled={loading}>
          {loading ? <div className="text-center"><Spinner animation="border" variant="success" /></div> : 'Login'}
        </Button>
      </Form>
    </AuthLayout>
  );
};

export default LoginPage;