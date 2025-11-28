import React, { useState } from 'react';
import { Container, Card, Alert, Spinner } from 'react-bootstrap';
import apiClient from '../../api/apiClient';
import Button from '../../components/common/Button';
import BackButton from '../../components/common/BackButton';
import './PurchasePassPage.css';

const PurchasePassPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const passPrice = 40.00;

  const handlePurchase = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/organiser/create-checkout-session');
      // Redirect the user to the Stripe Checkout page
      window.location.href = response.data.url;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to initiate payment.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <Container className="py-5 d-flex justify-content-center">
      <div style={{ width: '100%' }}>
        <BackButton to={`/info/user-profile`} place="My Profile"></BackButton>
        <Card className="border shadow-sm">
            <Card.Body className="p-4 p-md-5">
            <div>
                <h2 className="fw-bold">Become a Tournament Organiser</h2>
                <hr className="my-4" />
                <h5 className="mt-4 fw-semibold">Unlock the Power to Host Your Own Tournaments</h5>
                <ul className="text-start list-unstyled d-flex flex-column gap-1">
                    <li>✓ Create and manage unlimited tournaments.</li>
                    <li>✓ Manage participant registrations and approvals.</li>
                    <li>✓ Publish official tournament results.</li>
                </ul>
                

                <Card className="price-card my-4 text-center">
                    <Card.Body>
                        <p className="fw-bold mb-1 one-time-fee">One-Time Fee</p>
                        <div className="price-display">RM {passPrice.toFixed(2)}</div>
                    </Card.Body>
                </Card>

                {error && <Alert variant="danger">{error}</Alert>}
                
                <Button onClick={handlePurchase} disabled={loading} className="w-100">
                {loading ? <div className="text-center"><Spinner animation="border" variant="success" /></div> : 'Purchase Organiser Pass'}
                </Button>
            </div>
            </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default PurchasePassPage;