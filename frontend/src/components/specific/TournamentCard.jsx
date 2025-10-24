import React from 'react';
import { Card, Col } from 'react-bootstrap';
import { getImageUrl } from '../../utils/imageUrl';
import Button from '../../components/common/Button';

// Receives tournament data and displays it.
const TournamentCard = ({ tournament }) => {
    const imageUrl = getImageUrl(tournament.photo_path);

    return (
        <Col md={3} className="mb-4">
            <Card className="tournament-card h-100">
                <Card.Img variant="top" src={imageUrl} />
                <Card.Body className="d-flex flex-column">
                    <Card.Title>{tournament.name}</Card.Title>
                    <Card.Subtitle className="text-muted">{tournament.start_date}</Card.Subtitle>
                    <Button to={`/tournaments/${tournament.id}`}>Learn More</Button>
                </Card.Body>
            </Card>
        </Col>
    );
};

export default TournamentCard;