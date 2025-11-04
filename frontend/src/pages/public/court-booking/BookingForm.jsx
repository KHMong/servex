import { useState, useMemo, useEffect } from 'react';
import { Form, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate(); // Hook to redirect user after booking

  // STATE ===
  const [formData, setFormData] = useState({
    date: '',
    startTime: venue?.opening_time.substring(0, 5) || '',
    endTime: '',
    courtId: courts.length > 0 ? courts[0].id : '',
  });

  const [bookingStatus, setBookingStatus] = useState({
    status: 'idle', // idle, loading, success, error
    message: ''
  });
  
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const allTimeSlots = useMemo(() => 
    generateTimeSlots(venue.opening_time, venue.closing_time),
    [venue.opening_time, venue.closing_time]
  );

  const startTimeOptions = useMemo(() => 
    allTimeSlots.slice(0, -1),
    [allTimeSlots]
  );
  
  const endTimeOptions = useMemo(() => {
    if (!formData.startTime) return [];

    // Find the index of the selected startTime
    const startIndex = allTimeSlots.findIndex(slot => slot.value === formData.startTime);

    // If cannot find
    if (startIndex === -1) {
      return [];
    }

    // Slots after the index = endTimeSlots
    return allTimeSlots.slice(startIndex + 1);

  }, [formData.startTime, allTimeSlots]);

  useEffect(() => {
    // If start time is selected and there are end times
    if (formData.startTime && endTimeOptions.length > 0) {
      // Check if endTime is invalid (Not set or before/same as startTime)
      if (!formData.endTime || parseInt(formData.endTime.replace(':', '')) <= parseInt(formData.startTime.replace(':', ''))) {
        // Set endTime to first available option
        setFormData(prev => ({ ...prev, endTime: endTimeOptions[0].value }));
      }
    }
  }, [formData.startTime, formData.endTime, endTimeOptions]);

  // DATE
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0];

  // EVENT HANDLERS
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setBookingStatus({ status: 'idle', message: '' }); // Reset status on change
  };

  const handleBookNow = async (e) => {
    e.preventDefault();
    setBookingStatus({ status: 'loading', message: '' });

    try {
      const response = await apiClient.post('/bookings', formData);
      
      setBookingStatus({ status: 'success', message: 'Booking successful! Redirecting...' });
      
      // Redirect to a confirmation page after a short delay
      setTimeout(() => {
        navigate(`/booking-confirmation/${response.data.booking_id}`);
      }, 2000);

    } catch (err) {
      setBookingStatus({
        status: 'error',
        message: err.response?.data?.message || 'Booking failed. Please try again.'
      });
    }
  };

  return (
    <>
      <section>
        <h2 className="mb-4 fw-semibold">Book a Court</h2>
        <div className="p-4 border rounded shadow-sm bg-white">
          <Form onSubmit={handleBookNow}>
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
                  type="select" name="courtId" value={formData.courtId}
                  onChange={handleChange} options={courts.map(c => ({ value: c.id, label: c.name }))}
                />
              </Col>
              <Col md={6}>
                <FormField
                  label="Start Time"
                  type="select" name="startTime" value={formData.startTime}
                  onChange={handleChange} options={startTimeOptions}
                />
              </Col>
              <Col md={6}>
                <FormField
                  label="End Time"
                  type="select" name="endTime" value={formData.endTime}
                  onChange={handleChange} options={endTimeOptions}
                  disabled={!formData.startTime}
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
              disabled={bookingStatus.status === 'loading' || !formData.date || !formData.endTime}
            >
              {bookingStatus.status === 'loading' ? 'Processing...' : 'Book Now'}
            </Button>

            {bookingStatus.message && (
              <Alert variant={bookingStatus.status === 'success' ? 'success' : 'danger'} className="mt-3">
                {bookingStatus.message}
              </Alert>
            )}
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