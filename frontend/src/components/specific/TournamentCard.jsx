import React from 'react';
import { Card, Col } from 'react-bootstrap';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { getImageUrl } from '../../utils/imageUrl';
import Button from '../../components/common/Button';

import './TournamentCard.css';

// Receives tournament data and displays it.
const TournamentCard = ({ tournament }) => {
    const imageUrl = getImageUrl(tournament.photo_path);
    console.log(tournament);

    return (
        <Card className="tournament-card h-100">
            <Card.Img variant="top" src={imageUrl} />
            <Card.Body className="d-flex flex-column">
                <Card.Title className="fw-semibold">{tournament.name}</Card.Title>
                <div className="d-flex flex-column gap-1 mt-2 mb-4">
                    <div className="tournament-info-item text-muted">
                        <FaCalendarAlt className="icon" />
                        <span>{tournament.start_date_formatted} to {tournament.end_date_formatted}</span>
                    </div>
                    <div className="tournament-info-item text-muted">
                        <FaMapMarkerAlt className="icon" />
                        <span>{tournament.venue_address}, {tournament.state.name}</span>
                    </div>
                    <div className="tournament-info-item text-muted">
                        <FaClock className="icon" />
                        <span>Register by {tournament.deadline_formatted}</span>
                    </div>
                </div>
                <Button to={`/tournaments/${tournament.id}`} variant="secondary">Learn More</Button>
            </Card.Body>
        </Card>
    );
};

export default TournamentCard;