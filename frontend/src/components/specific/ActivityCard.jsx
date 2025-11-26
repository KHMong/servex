import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import { HiUsers } from "react-icons/hi";
import { getImageUrl } from '../../utils/imageUrl';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import apiClient from '../../api/apiClient';
import './ActivityCard.css';
import '../common/Badge.css';

const ActivityCard = ({ activity, onActionSuccess }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();

  const imageUrl = getImageUrl(activity.host.photo_path);

  // Put CSS class based on skill level
  const getSkillClass = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'skill-beginner';
      case 'intermediate': return 'skill-intermediate';
      case 'advanced': return 'skill-advanced';
      default: return 'skill-all';
    }
  };

  const handleJoin = async () => {
    if (window.confirm("Are you sure you want to join this activity?")) {
      showNotification('Joining the activity...', 'info');
      try {
        await apiClient.post(`/activities/${activity.id}/join`);
        showNotification('You have successfully joined the activity.', 'success');
        onActionSuccess(); // Call the refresh function
      } catch (err) {
        showNotification(err.response?.data?.message || "Failed to join activity.", 'error');
      }
    }
  };

  const renderJoinButton = () => {
    // User is not logged in
    if (!isAuthenticated) {
      return (
        <Button 
          className="w-100 mt-2"
          disabled={activity.is_full}
          onClick={() => navigate('/login', { state: { from: location } })}
        >
          {activity.is_full ? 'Session Full' : 'Join Game'}
        </Button>
      );
    } else {
      return (
        <Button 
          onClick={handleJoin}
          disabled={activity.is_full}
          className="w-100 mt-2"
        >
          {activity.is_full ? 'Session Full' : 'Join Game'}
        </Button>
      );
    }
  };

  return (
    <Card className="activity-card mb-3">
      <Card.Body as={Row} className="justify-content-center align-items-center gap-3">
        {/* Date Section */}
        <Col lg={2} md={3} xs={4} className="date-block text-center">
          <div className="day-name">{activity.date_day_name}</div>
          <div className="day-number">{activity.date_day}</div>
          <div className="month-name">{activity.date_short_month_year}</div>
          <div className="time-range">{activity.time_range}</div>
        </Col>

        {/* Main Content */}
        <Col lg={5} md={8} className="">
          <h5 className="venue-name">{activity.venue.name}</h5>
          <div className="venue-location">{activity.venue.state}</div>
          <div className="details-row mt-3">
            <span className={`skill-badge ${getSkillClass(activity.skill_level)}`}>
              {activity.skill_level}
            </span>
            <div>
                <span className="detail-item"><span className="fw-semibold">RM {activity.fee}</span> / person</span>
            </div>
            <div className="d-flex gap-2">
                <HiUsers className="icon" />
                <span className="detail-item"><span className="fw-semibold">{activity.participants_count}</span> / {activity.max_players} Players</span>
            </div>
          </div>
        </Col>

        {/* Host Info and Action Button */}
        <Col lg={3} md={10} className="host-section d-flex flex-column align-items-center text-center">
          <img src={imageUrl} alt={activity.host.name} className="host-avatar" />
          <div className="host-info">Hosted by <span className="host-name">{activity.host.name}</span></div>
          <div className="host-info">({activity.host.phone_no})</div>
          {renderJoinButton()}
        </Col>
      </Card.Body>
    </Card>
  );
};

export default ActivityCard;