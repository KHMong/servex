import React from 'react';
import { Card } from 'react-bootstrap';
import Button from '../common/Button';
import { getImageUrl } from '../../utils/imageUrl';

import './CoachCard.css';

const CoachCard = ({ coach }) => {
  console.log(coach);
  const coachPhoto = getImageUrl(coach.photo_path);

  return (
    <Card className="text-center h-100 coach-card">
      <Card.Body>
        <img src={coachPhoto} alt={coach.name} className="coach-avatar mb-3" />
        <Card.Title className="fw-semibold">{coach.name}</Card.Title>
        <Card.Text className="text-muted mb-2">
          {coach.exp_year} years of experience
        </Card.Text>
        <Card.Text className="text-muted">
          {coach.state.name}
        </Card.Text>
        <Button to={`/coaches/${coach.user_id}`} variant="secondary" className="w-100 mt-3">
          View Profile
        </Button>
      </Card.Body>
    </Card>
  );
};

export default CoachCard;