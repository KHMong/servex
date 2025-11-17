import React from 'react';
import { Card } from 'react-bootstrap';
import Button from '../../components/common/Button';

const BookingHistoryCard = ({ booking, onCancel }) => {
  return (
    <Card className="border shadow-sm booking-history-card mb-3">
      <Card.Header className="fw-bold h5">Booking Id: <span className="fw-semibold">{booking.booking_id}</span></Card.Header>
      <Card.Body>
        <div className="d-flex justify-content-between">
          <div>
            <p className="mb-1 text-muted"><strong>Venue:</strong> {booking.venue.name}</p>
            <p className="mb-1 text-muted"><strong>Court:</strong> {booking.court.name}</p>
            <p className="mb-1 text-muted"><strong>Date:</strong> {booking.date}</p>
            <p className="mb-1 text-muted"><strong>Time:</strong> {booking.time_range}</p>
            {booking.voucher_code_applied && (
              <p className="mb-1 text-muted"><strong>Voucher Applied:</strong> {booking.voucher_code_applied}</p>
            )}
            <p className="mb-0"><strong>Price: RM {booking.initial_total}</strong></p>
          </div>
          <div className="d-flex align-items-end">
            {booking.status === 'Confirmed' && (
              <Button 
                variant="red"
                onClick={() => onCancel(booking.id)}
              >
                Cancel Booking
              </Button>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default BookingHistoryCard;