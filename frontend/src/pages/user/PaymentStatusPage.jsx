import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import { useNotification } from '../../contexts/NotificationContext';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../contexts/AuthContext';

const PaymentStatusPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { user, setUser } = useAuth();
  
  // Status: verifying, success, failed, cancelled
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const paymentType = searchParams.get('type');
    const paymentStatus = searchParams.get('status');
    
    // Get optional booking ID
    const bookingId = searchParams.get('booking_id');

    const paymentConfig = {
      booking: {
        verifyUrl: `/verify-booking-payment`,
        successRedirect: `/info/booking-history`,
        cancelRedirect: `/bookings/${bookingId}/confirm`,
        successMessage: 'Booking confirmed successfully.',
      },
      organiser_pass: {
        verifyUrl: `/organiser/verify-payment`,
        successRedirect: `/info/user-profile`,
        cancelRedirect: `/organiser/purchase-pass`,
        successMessage: 'Organiser Pass activated successfully.',
        onSuccess: () => setUser({ ...user, is_organiser: true }),
      },
    };

    const config = paymentConfig[paymentType];
    
    // Cancelled Payment
    if (paymentStatus === 'cancelled') {
      setStatus('cancelled');
      setMessage('Payment was cancelled. You have not been charged.');
      showNotification('Payment cancelled.', 'info');
      setTimeout(() => navigate(config?.cancelRedirect || '/', { replace: true }), 5000);
      return;
    }

    // --- Handle Verification ---
    if (!sessionId || !config) {
      setStatus('failed');
      setMessage('Invalid payment details found in URL.');
      return;
    }

    const verifyPayment = async () => {
      try {
        await apiClient.post(config.verifyUrl, { session_id: sessionId });
        setStatus('success');
        setMessage(config.successMessage);
        showNotification(config.successMessage, 'success');
        
        if (config.onSuccess) {
          config.onSuccess();
        }

        setTimeout(() => navigate(config.successRedirect, { replace: true }), 5000);

      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to verify payment.';
        setStatus('failed');
        setMessage(errorMessage);
        showNotification(errorMessage, 'error');
        setTimeout(() => navigate(config.cancelRedirect || '/', { replace: true }), 5000);
      }
    };

    verifyPayment();
  }, [searchParams, navigate, user, setUser]);

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <>
            <Spinner animation="border" variant="success" style={{ width: '3rem', height: '3rem' }} />
            <h3 className="mt-3">Verifying your payment...</h3>
            <p className="text-muted">Please do not close this window.</p>
          </>
        );
      case 'success':
        return (
          <>
            <h3 className="text-success">Payment Successful!</h3>
            <p className="text-muted">{message}</p>
            <p className="text-muted">You will be redirected shortly...</p>
          </>
        );
      case 'failed':
      case 'cancelled':
        return (
          <>
            <h4>Payment Failed/Cancelled</h4>
            <p>{message}</p>
            <p className="text-muted">You will be redirected shortly...</p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="text-center">
        {renderContent()}
      </div>
    </Container>
  );
};

export default PaymentStatusPage;