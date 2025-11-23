import React from 'react';
import { Card } from 'react-bootstrap';

const PlayerGroupCard = ({ group }) => {
  return (
    <Card className="mb-3 shadow-sm border">
      <Card.Body>
        <h5 className="fw-bold mb-3">{group.name}</h5>
        <div className="text-muted small">
          <p className="mb-1"><strong>Coach:</strong> {group.coach_name}</p>
          <p className="mb-1"><strong>Email:</strong> {group.coach_email}</p>
          <p className="mb-0"><strong>Phone Number:</strong> {group.coach_phone}</p>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PlayerGroupCard;