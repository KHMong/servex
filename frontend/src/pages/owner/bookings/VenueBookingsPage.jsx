import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Row, Col, Card, Spinner } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';

import apiClient from '../../../api/apiClient';
import { useNotification } from '../../../contexts/NotificationContext';
import BackButton from '../../../components/common/BackButton';
import FormField from '../../../components/common/FormField';
import Button from '../../../components/common/Button';

import '../../../components/common/SearchFilter.css';
import './VenueBookingsPage.css';

const VenueBookingsPage = () => {
  const { venueId } = useParams();
  const { showNotification } = useNotification();

  // State
  const [venueName, setVenueName] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduleData, setScheduleData] = useState({ slots: [], courts: [] });
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    court_id: '',
    start_time: '',
    duration: 1,
  });
  
  // Price 
  const [prices, setPrices] = useState({ weekday: 0, weekend: 0 });
  const [totalPrice, setTotalPrice] = useState('0.00');

  // Fetch schedule
  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const [res, courtsRes] = await Promise.all([
        apiClient.get(`/owner/venues/${venueId}/schedule?date=${selectedDate}`),
        apiClient.get(`/owner/venues/${venueId}/court-list`),
      ]);

      setScheduleData(res.data);
      setVenueName(res.data.venue_name);
      setCourts(courtsRes.data);
      setPrices({ 
        weekday: res.data.weekday_price, 
        weekend: res.data.weekend_price 
      });
      
      if (courtsRes.data.length > 0 && !formData.court_id) {
        setFormData(prev => ({ ...prev, court_id: courtsRes.data[0].id }));
      }

      if (res.data.opening_time) {
        const formattedTime = res.data.opening_time.substring(0, 5);
        setFormData(prev => ({ ...prev, start_time: formattedTime }));
      }

    } catch (err) {
      showNotification("Failed to load schedule.", "error");
    } finally {
      setLoading(false);
    }
  }, [venueId, formData.court_id, selectedDate, showNotification]);

  useEffect(() => {
    fetchSchedule();
  }, [venueId, selectedDate, fetchSchedule]);

  useEffect(() => {
    if (!selectedDate) return;

    // Determine Day Type
    const dateObj = new Date(selectedDate);
    const day = dateObj.getDay();
    const isWeekend = (day === 0 || day === 6); // Saturday/Sunday

    // Select Pricing Rule
    const rate = isWeekend ? prices.weekend : prices.weekday;

    // Calculate Total
    const total = rate * formData.duration;
    
    setTotalPrice(total.toFixed(2));

  }, [selectedDate, formData.duration, prices]);

  // Handlers
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    // Reset form time when date changes
    setFormData(prev => ({ ...prev, start_time: '' }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await apiClient.delete(`/owner/bookings/${bookingId}`);
        showNotification("Booking cancelled successfully.", "success");
        fetchSchedule();
      } catch (err) {
        showNotification(err.response?.data?.message || "Failed to cancel booking.", "error");
      }
    }
  };

  const handleBookNow = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post(`/owner/venues/${venueId}/book`, {
        ...formData,
        date: selectedDate
      });
      showNotification("Booking created successfully!", "success");
      fetchSchedule();
    } catch (err) {
      showNotification(err.response?.data?.message || "Failed to create booking.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const add30Minutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + 30);
    return date.toTimeString().substring(0, 5);
  };

  // Time Slots
  const renderTimeSlots = (court) => {
    const cells = [];
    const slots = scheduleData.slots || [];
    
    let skipSlots = 0;

    slots.forEach((time, index) => {
      if (skipSlots > 0) {
        skipSlots--;
        return;
      }

      // Check if a booking start at this time
      const booking = (court.bookings || []).find(b => {
        const timePart = b.start_datetime.split(/[\sT]/)[1];
        const bookingTime = timePart.substring(0, 5);
        return bookingTime === time;
      });

      if (booking) {
        // Calculate duration in 30 min gap
        const start = new Date(booking.start_datetime);
        const end = new Date(booking.end_datetime);
        const durationMinutes = (end - start) / 60000;
        const span = Math.ceil(durationMinutes / 30);
        
        skipSlots = span - 1; // Skip the next N slots

        const isCancelable = new Date(booking.start_datetime) > new Date();
        const displayUserInfo = booking.user ? (booking.user.name + " (" + booking.user.user_id + ")") : "Guest";

        cells.push(
          <div 
            key={`${court.id}-${time}`} 
            className="grid-cell booked"
            style={{ gridColumn: `span ${span}` }}
            onClick={() => isCancelable && handleCancelBooking(booking.id)}
            title={isCancelable ? "Click to Cancel" : "Past Booking"}
          >
            <span className="booking-name">{displayUserInfo}</span>
          </div>
        );
      } else {
        // Empty Slot
        cells.push(
          <div key={`${court.id}-${time}`} className="grid-cell available"></div>
        );
      }
    });

    return cells;
  };

  // Options
  const courtOptions = (courts || []).map(c => ({ value: c.id, label: c.name }));
  const allTimeOptions = scheduleData.slots.map(t => ({ value: t, label: t }));
  const durationOptions = Array.from({ length: 24 }, (_, i) => 
  {
    const value = i + 1;
    return {
        value: value,
        label: value, 
    };
  });

  return (
    <>
      <BackButton to="/owner/venues" place="Venues" />
      
      <div className="d-flex flex-column gap-3 mb-4">
        <h2 className="fw-bold mb-0">{venueName}</h2>
        <Form.Control 
          type="date" 
          value={selectedDate} 
          onChange={handleDateChange} 
          style={{ width: '200px' }}
        />
      </div>

      {/* Legend */}
      <div className="d-flex gap-4 mb-3">
        <div className="d-flex align-items-center gap-2"><span className="legend-box available"></span>Available</div>
        <div className="d-flex align-items-center gap-2"><span className="legend-box booked"></span>Booked</div>
      </div>

      {/* Schedule */}
      {loading ? (
        <div className="text-center p-5"><Spinner animation="border" variant="success" /></div>
      ) : (
        <div className="schedule-wrapper mb-5" style={{ minWidth: 0 }}>
            <div className="schedule-grid" style={{ '--slot-count': scheduleData.slots.length }}>
                {/* Header */}
                <div className="grid-header sticky-col">Court</div>
                {scheduleData.slots.map(t => (
                    <div key={t} className="grid-header">
                        {t}<br/>-<br/>{add30Minutes(t)}
                    </div>
                ))}

                {/* Rows */}
                {scheduleData.courts.map(court => (
                <Fragment key={court.id}>
                    <div className="court-col sticky-col">
                    {court.name}
                    {court.status !== 'Available' && <span className="court-status">({court.status})</span>}
                    </div>
                    {renderTimeSlots(court)}
                </Fragment>
                ))}
            </div>
        </div>
      )}

      {/* Add Booking Section */}
      <h4 className="fw-bold mb-3">Add New Booking</h4>
      <Card className="border-0 shadow-sm bg-white">
        <Card.Body className="p-4">
          <Form onSubmit={handleBookNow}>
            <Row>
              <Col md={4}>
                <FormField 
                  label="Court" 
                  type="select" 
                  name="court_id" 
                  value={formData.court_id} 
                  onChange={handleFormChange}
                  options={courtOptions}
                  required
                />
              </Col>
              <Col md={4}>
                <FormField 
                  label="Start Time" 
                  type="select" 
                  name="start_time" 
                  value={formData.start_time} 
                  onChange={handleFormChange}
                  options={allTimeOptions}
                  required
                />
              </Col>
              <Col md={4}>
                <FormField 
                  label="Duration (Hours)" 
                  type="select" 
                  name="duration" 
                  value={formData.duration} 
                  onChange={handleFormChange}
                  options={durationOptions}
                  required
                />
              </Col>
            </Row>

            {/* Summary Section */}
            <div className="bg-light p-3 rounded mb-3 d-flex justify-content-between align-items-center">
              <div>
                <strong>Summary: </strong> 
                <div>{selectedDate} &bull; {formData.start_time || '--:--'} ({formData.duration} Hours)</div>
              </div>
              
              {/* Price */}
              <div className="text-end">
                <div className="text-muted small">
                  Total Price
                </div>
                <div className="fw-bold" style={{ fontSize: '1.2rem' }}>
                  RM {totalPrice}
                </div>
              </div>
            </div>

            <Button type="submit" className="mt-3 w-100" disabled={submitting || loading}>
              {submitting ? <div className="text-center"><Spinner animation="border" /></div> : <><FaPlus className="me-2"/> Add Booking</>}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
};

export default VenueBookingsPage;