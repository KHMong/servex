import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Spinner, Alert } from 'react-bootstrap';
import apiClient from '../../../api/apiClient';
import Button from '../../../components/common/Button';
import './AvailabilityModal.css';

const generateTimeSlots = (start, end) => {
  if (!start || !end) {
    return [];
  }

  const slots = [];
  const interval = 30; // 30-minute gaps
  let currentTime = new Date(`1970-01-01T${start}`);
  const endTime = new Date(`1970-01-01T${end}`);

  while (currentTime <= endTime) {
    const time = currentTime.toTimeString().substring(0, 5); // Format as "HH:mm"
    slots.push({ value: time, label: time });
    currentTime.setMinutes(currentTime.getMinutes() + interval);
  }

  return slots;
};

const AvailabilityModal = ({ show, onHide, venue, selectedDate }) => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const timeSlots = useMemo(() => {
    if (!venue) return [];
    return generateTimeSlots(venue.opening_time, venue.closing_time, 30);
  }, [venue]);

  const timeHeaders = useMemo(() => {
    return timeSlots.map((slot) => {
      const start = new Date(`1970-01-01T${slot.value}`);
      const end = new Date(start.getTime() + 30 * 60000);
      return `${slot.value} - ${end.toTimeString().substring(0, 5)}`;
    });
  }, [timeSlots]);

  useEffect(() => {
    if (show && selectedDate) {
      const fetchAvailability = async () => {
        setLoading(true);
        setError(null);
        try {
          const params = new URLSearchParams({ date: selectedDate });
          const res = await apiClient.get(`/venues/${venue.id}/availability-by-date?${params}`);
          setSchedule(res.data);
        } catch (err) {
          setError('Failed to load availability data.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchAvailability();
    }
  }, [show, selectedDate, venue.id]);

  const isSlotBooked = (court, timeSlotStart) => {
    const slotStartDateTime = new Date(`${selectedDate}T${timeSlotStart}:00`);
    
    for (const booking of court.bookings) {
      const bookingStart = new Date(booking.start_datetime);
      const bookingEnd = new Date(booking.end_datetime);
      if (slotStartDateTime >= bookingStart && slotStartDateTime < bookingEnd) {
        return true;
      }
    }
    return false;
  };

  const formattedDate = new Date(selectedDate).toLocaleDateString('en-MY', {
    weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit',
  });

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header className="flex-column align-items-start">
        <div className="d-flex justify-content-between align-items-center w-100">
            <Modal.Title as="h2" className="fw-semibold">Availability</Modal.Title>
            <Button onClick={onHide} variant="tertiary">Close</Button>
        </div>
        <p className="text-muted mb-0">For {formattedDate}</p>  
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex gap-4 mb-3">
            {/* Legend */}
            <div className="d-flex align-items-center gap-2"><div className="available-status"></div>Available</div>
            <div className="d-flex align-items-center gap-2"><div className="booked-status"></div>Booked/Maintenance</div>
        </div>
        
        {loading && <div className="text-center"><Spinner animation="border" /></div>}
        {error && <Alert variant="danger">{error}</Alert>}
        
        {!loading && !error && (
            <div className="availability-grid-wrapper">
                <div className="availability-grid" style={{ '--time-slot-count': timeSlots.length }}>
                    {/* Header Row */}
                    <div className="grid-header court-header">Court</div>
                    {timeHeaders.map(header => <div key={header} className="grid-header">{header}</div>)}

                    {/* Data Rows */}
                    {schedule.map(court => [
                        <div key={court.id} className="court-name-cell">
                            {court.name}
                            {court.status !== 'Available' && <span className="court-status">(Maintenance)</span>}
                        </div>,

                        ...timeSlots.map(slot => {
                            const isBooked = court.status !== 'Available' || isSlotBooked(court, slot.value);
                            return (
                                <div 
                                    key={`${court.id}-${slot.value}`}
                                    className={`time-slot ${isBooked ? 'booked' : 'available'}`}
                                >
                                    
                                </div>
                            );
                        })
                    ])}
                </div>
            </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AvailabilityModal;