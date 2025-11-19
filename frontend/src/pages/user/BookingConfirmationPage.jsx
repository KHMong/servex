import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { useNotification } from '../../contexts/NotificationContext';
import Button from '../../components/common/Button';
import BackButton from '../../components/common/BackButton';
import FormField from '../../components/common/FormField';
import apiClient from '../../api/apiClient';

const BookingConfirmationPage = () => {
  const { bookingId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [vouchers, setVouchers] = useState([]);

  const [selectedVoucher, setSelectedVoucher] = useState('');
  const [code, setCode] = useState(null);
  const [discount, setDiscount] = useState(null);
  const [total, setTotal] = useState(null);
  const [pointsEarned, setPointsEarned] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const { showNotification } = useNotification();

  // Fetch booking details and available vouchers
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bookingRes, vouchersRes] = await Promise.all([
          apiClient.get(`/bookings/${bookingId}`),
          apiClient.get('/user/vouchers')
        ]);
        setBooking(bookingRes.data.data);
        setVouchers(vouchersRes.data.data);
        setTotal(bookingRes.data.data.total_price);
        setPointsEarned(bookingRes.data.data.points_earned);
      } catch (err) {
        setError("Failed to load booking details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [bookingId]);

  useEffect(() => {
    if (searchParams.get('payment') === 'cancelled') {
      showNotification('Payment was cancelled. Your booking has not been confirmed.', 'info');
    }
  }, [searchParams, showNotification]);

  // Apply voucher
  const handleApplyVoucher = (voucherHistoryId) => {
    setSelectedVoucher(voucherHistoryId);
    
    // Find the selected voucher
    const selected = vouchers.find(v => v.id === parseInt(voucherHistoryId));

    // New code
    const newCode = selected ? selected.voucher.code : null;

    // New discount
    const newDiscount = selected ? selected.voucher.discount_value : 0;

    // New total
    let newTotal = booking.subtotal - newDiscount;
    newTotal = newTotal < 0 ? 0 : newTotal;

    // New points earned
    const newPointsEarned = Math.floor(newTotal);
    
    // Set value
    setCode(newCode);
    setDiscount(newDiscount);
    setTotal(newTotal);
    setPointsEarned(newPointsEarned);
  };

  const handleConfirmAndPay = async () => {
    setConfirming(true);
    setError('');

    try {
      // Create checkout session
      const response = await apiClient.post(`/bookings/${bookingId}/create-checkout-session`, {
          voucher_history_id: selectedVoucher 
      });

      if (response.data.status === 'confirmed_free') { // Free
        showNotification(response.data.message, 'success');
        navigate('/info/booking-history');
      } else { // Payment
        window.location.href = response.data.url;
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm and pay. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <div className="text-center p-5"><Spinner /></div>;
  if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;
  if (!booking) return null;

  const noOption = { value: '', label: `Don't Apply Voucher`};
  const voucherOptions = vouchers.map(v => ({
    value: v.id, 
    label: `${v.voucher.code} (EXP: ${v.expiry_date})`
  }));
  const allVoucherOptions = [noOption, ...voucherOptions];

  return (
    <Container className="py-5">
      <BackButton to={`/venues/${booking.venue.id}`} place="Venue"></BackButton>
      <h2 className="fw-bold mt-2">Confirm Your Booking</h2>
      <Row className="mt-4 gap-5">
        {/* Apply Voucher */}
        <Col md={4}>
          <h5 className="fw-semibold mb-3">Apply a Voucher</h5>
          <Card className="px-4 py-3">
            <FormField
              label="Voucher"
              type="select" 
              value={selectedVoucher}
              onChange={(e) => handleApplyVoucher(e.target.value)}
              options={allVoucherOptions}
            >
            </FormField>
          </Card>
          
        </Col>
        
        {/* Booking Summary */}
        <Col md={7}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h3 className="fw-bold mb-2">Booking Summary</h3>
              <hr />
              <h5 className="fw-semibold">{booking.venue.name}</h5>
              <p className="text-muted">{booking.venue.address}, {booking.venue.state}</p>
              <hr />
              <p className="mb-1"><strong>Court:</strong> {booking.court.name}</p>
              <p className="mb-1"><strong>Date:</strong> {booking.date}</p>
              <p className="mb-1"><strong>Time:</strong> {booking.time_range}</p>
              <hr />
              <div className="d-flex justify-content-between text-muted"><span>Subtotal</span><span>RM {booking.subtotal}</span></div>
              {(discount > 0 || code) && (
                <div className="d-flex justify-content-between fw-semibold" style={{color: 'var(--servex-green)'}}>
                  <span>Discount ({code})</span>
                  <span>- RM {discount}</span>
                </div>
              )}
              <div className="d-flex justify-content-between text-muted"><span>Points to be earned</span><span>{pointsEarned} pts</span></div>
              <hr />
              <div className="d-flex justify-content-between h5 fw-bold"><span>Total</span><span>RM {total}</span></div>
              <Button type="submit" className="w-100 mt-4" onClick={handleConfirmAndPay} disabled={confirming}>
                {confirming ? <div className="text-center"><Spinner animation="border" variant="success" /></div> : 'Confirm & Pay'}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default BookingConfirmationPage;