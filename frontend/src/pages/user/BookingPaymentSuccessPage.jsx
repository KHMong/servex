import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert } from 'react-bootstrap';
import { useNotification } from '../../contexts/NotificationContext';
import apiClient from '../../api/apiClient';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  // Status: verifying, success, error
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setStatus('error');
      setError('No payment session ID found.');
      return;
    }

    const verify = async () => {
      try {
        await apiClient.post('/verify-booking-payment', { session_id: sessionId });
        setStatus('success');
        showNotification('Booking confirmed successfully.', 'success');
        
        // Redirect to Booking History Page
        setTimeout(() => {
          navigate('/info/booking-history', { replace: true });
        }, 3000);
        
      } catch (err) {
        setStatus('error');
        setError(err.response?.data?.message || 'Failed to verify payment.');
        showNotification('Booking failed.', 'error');
      }
    };

    verify();
  }, [searchParams, navigate, showNotification]);

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="text-center">
        {status === 'verifying' && (
          <>
            <Spinner animation="border" variant="success" style={{ width: '3rem', height: '3rem' }} />
            <h3 className="mt-3">Verifying your payment...</h3>
            <p className="text-muted">Please do not close this window.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <h3 className="text-success">Payment Successful!</h3>
            <p className="text-muted">Redirecting to booking history...</p>
          </>
        )}
        {status === 'error' && (
          <Alert variant="danger">
            <h4>Verification Failed</h4>
            <p>{error}</p>
          </Alert>
        )}
      </div>
    </Container>
  );
};

export default PaymentSuccessPage;