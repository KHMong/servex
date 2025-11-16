import React from 'react';
import { Card } from 'react-bootstrap';
import Button from '../common/Button';
import { getImageUrl } from '../../utils/imageUrl';
import './TournamentHistoryCard.css';

const TournamentHistoryCard = ({ registration, onCancel, onViewResult }) => {
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'status-approved';
      case 'pending': return 'status-pending';
      case 'rejected': return 'status-rejected';
      default: return 'status-default';
    }
  };

  return (
    <Card className="p-2 border-0 shadow-sm history-card mb-3">
      <Card.Body>
        <div className="d-flex justify-content-between gap-3">
          <div>
            <h5 className="fw-bold">{registration.tournament.name}</h5>
            <p className="mb-1 text-muted"><strong>Category:</strong> {registration.category_name}</p>
            {registration.partner && <p className="mb-1 text-muted"><strong>Partner:</strong> {registration.partner.name} ({registration.partner.user_id})</p>}
            <p className="mb-1 text-muted"><strong>Emergency Contact:</strong> {registration.ec_phone_no}</p>
            <p className="mb-1 text-muted"><strong>Date:</strong> {registration.tournament.start_date_formatted}</p>
            <p className="mb-1 text-muted"><strong>Venue:</strong> {registration.tournament.venue_address}</p>
            <Button className="mt-2" variant="secondary" to={`/tournaments/${registration.tournament.id}`}>Tournament Details</Button>
          </div>
          <div className="d-flex flex-column justify-content-between text-end">
            {/* Show status for Upcoming tab */}
            {onCancel && <div><span className={`status-badge ${getStatusBadgeClass(registration.status)}`}>{registration.status}</span></div>}
            
            <div className="mt-3">
            {/* Show Cancel button if status is Pending and it is the User who register */}
            {registration.status === 'Pending' && registration.can_cancel && onCancel && (
                <Button variant="red" onClick={() => onCancel(registration.id)} className="mb-2">Cancel Registration</Button>
            )}
            {/* Show View Result button if have result */}
            {onViewResult && registration.tournament.result_path && (
                <Button variant="tertiary" onClick={() => onViewResult(getImageUrl(registration.tournament.result_path))} className="mb-2">View Result</Button>
            )}
            
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TournamentHistoryCard;