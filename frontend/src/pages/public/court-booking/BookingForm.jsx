import { useState, useMemo } from 'react';
import { Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import apiClient from '../../../api/apiClient';

import FormField from '../../../components/common/FormField';
import Button from '../../../components/common/Button';
import AvailabilityModal from './AvailabilityModal';

const generateTimeSlots = (start, end) => {
  if (!start || !end) {
    return [];
  }

  const slots = [];
  const interval = 30; // 30-minute gaps
  let currentTime = new Date(`1970-01-01T${start}`);
  const endTime = new Date(`1970-01-01T${end}`);

  // Handle overnight situation
  if (endTime <= currentTime) {
    endTime.setDate(endTime.getDate() + 1);
  }

  while (currentTime <= endTime) {
    const time = currentTime.toTimeString().substring(0, 5); // Format as "HH:mm"
    slots.push({ value: time, label: time });
    currentTime.setMinutes(currentTime.getMinutes() + interval);
  }

  return slots;
};


const BookingForm = ({ venue, courts }) => {
  // === HOOK ===
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // === STATE ===
  const [formData, setFormData] = useState({
    date: '',
    start_time: venue?.opening_time.substring(0, 5) || '',
    duration: 1,
    court_id: courts.length > 0 ? courts[0].id : '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const allTimeSlots = useMemo(() => 
    generateTimeSlots(venue.opening_time, venue.closing_time),
    [venue.opening_time, venue.closing_time]
  );

  const startTimeOptions = useMemo(() => 
    allTimeSlots.slice(0, -1),
    [allTimeSlots]
  );

  const durationOptions = Array.from({ length: 24 }, (_, i) => 
  {
    const value = i + 1;
    return {
        value: value,
        label: value, 
    };
  });

  // DATE
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0];

  // EVENT HANDLERS
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBookNow = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    
    try {
      setLoading(true);
      const response = await apiClient.post('/bookings', formData);
      
      // Redirect to Booking Confirmation Page 
      navigate(`/bookings/${response.data.data.id}/summary`);

    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section>
        <h2 className="fw-semibold">Book a Court</h2>
        <p>Select the preferred court and date to start booking!</p>
        <div className="p-4 border rounded shadow-sm bg-white">
          <Form onSubmit={handleBookNow}>
            {error && <Alert variant="danger">{error}</Alert>}
            <Row>
              <Col md={6}>
                <FormField
                  label="Date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  min={today}
                  max={maxDate}
                />
              </Col>
              <Col md={6}>
                <FormField
                  label="Court"
                  type="select" name="court_id" value={formData.court_id}
                  onChange={handleChange} required options={courts.map(c => ({ value: c.id, label: c.name }))}
                />
              </Col>
              <Col md={6}>
                <FormField
                  label="Start Time"
                  type="select" name="start_time" value={formData.start_time}
                  onChange={handleChange} required options={startTimeOptions}
                />
              </Col>
              <Col md={6}>
                <FormField
                  label="Duration (Hours)"
                  type="select" name="duration" value={formData.duration}
                  onChange={handleChange} required options={durationOptions}
                  disabled={!formData.start_time}
                />
              </Col>
            </Row>

            <Button
                type="button"
                variant="secondary"
                className="w-100 mt-3"
                onClick={() => formData.date ? setShowScheduleModal(true) : alert('Please select a date to view the availability.')}
              >
                View Availability
              </Button>
            <Button
              type="submit"
              variant="primary"
              className="w-100 mt-3"
              disabled={loading || !formData.date}
            >
              {loading ? <div className="text-center"><Spinner animation="border" variant="success" /></div> : 'Book Now'}
            </Button>
          </Form>
        </div>
      </section>

      {/* The Availability Modal (Overlay) */}
      <AvailabilityModal 
        show={showScheduleModal} 
        onHide={() => setShowScheduleModal(false)}
        venue={venue}
        selectedDate={formData.date}
      />
    </>
  );
};

export default BookingForm;