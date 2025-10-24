import React from 'react';
import { Card, Col } from 'react-bootstrap';
import { getImageUrl } from '../../utils/imageUrl';
import Button from '../../components/common/Button';

// Receives venue data and displays it.
const VenueCard = ({ venue }) => {
  const imageUrl = getImageUrl(venue.cover_photo_path);

  return (
    <Col md={3} className="mb-4">
        <Card className="venue-card h-100">
            <Card.Img variant="top" src={imageUrl} />
            <Card.Body className="d-flex flex-column">
                <Card.Title>{venue.name}</Card.Title>
                <Card.Subtitle className="text-muted">{venue.state.name}</Card.Subtitle>
                <Button to={`/venues/${venue.id}`} variant="secondary">View Details</Button>
            </Card.Body>
        </Card>
    </Col>
  );
};

export default VenueCard;