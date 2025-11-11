import React from 'react';
import { Card } from 'react-bootstrap';

const BookingHistoryPage = () => {
  return (
    <Card className="p-4 border-0 shadow-sm">
      <Card.Body>
        <h2 className="mb-4">Booking History</h2>
        <p>Your booking history will be displayed here.</p>
      </Card.Body>
    </Card>
  );
};

export default BookingHistoryPage;