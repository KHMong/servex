import React from 'react';
import { Card } from 'react-bootstrap';
import Button from '../common/Button';
import './ActivityHistoryCard.css';

const ActivityHistoryCard = ({ activity, onLeave, onCancel, onViewParticipants }) => {
  const isFull = activity.participants_count >= activity.max_players;

  return (
    <Card className="border shadow-sm activity-history-card mb-3">
      <Card.Header className="fw-bold">{activity.venue.name}</Card.Header>
      <Card.Body>
        <div className="d-flex justify-content-between">
          <div>
            <p className="mb-1 text-muted"><strong>Host:</strong> {activity.host.name} ({activity.host.phone_no})</p>
            <p className="mb-1 text-muted"><strong>Date:</strong> {activity.date_formatted}</p>
            <p className="mb-1 text-muted"><strong>Time:</strong> {activity.time_range}</p>
            <p className="mb-1 text-muted"><strong>Venue Address:</strong> {activity.venue.address}</p>
            <p className="mb-1 text-muted"><strong>Skill Level:</strong> {activity.skill_level}</p>
            <p className="mb-0 text-muted"><strong>Fee:</strong> RM {activity.fee}</p>
            <Button className="mt-2" variant="secondary" onClick={() => onViewParticipants(activity.id)}>
              View Participants
            </Button>
          </div>
          <div className="d-flex flex-column justify-content-between text-end">
            <div className="d-flex justify-content-end align-items-center mb-3">
              {(onLeave || onCancel) && (
                <span className={`status-badge-sm ${isFull ? 'status-full' : 'status-open'}`}>
                  {isFull ? 'Full' : 'Open'}
                </span>
              )}
              <span className="fw-semibold text-muted ms-2">{activity.participants_count} / {activity.max_players} Players</span>
            </div>
            {onLeave && <Button variant="red" onClick={() => onLeave(activity.id)}>Leave Activity</Button>}
            {onCancel && <Button variant="red" onClick={() => onCancel(activity.id)}>Cancel Activity</Button>}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};
export default ActivityHistoryCard;