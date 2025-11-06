import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import Button from '../common/Button';
import { HiUsers } from "react-icons/hi";
import { getImageUrl } from '../../utils/imageUrl';

import './ActivityCard.css';

const ActivityCard = ({ activity }) => {
  const imageUrl = getImageUrl(activity.host.photo_path);

  console.log(activity);

  // Put CSS class based on skill level
  const getSkillClass = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'skill-beginner';
      case 'intermediate': return 'skill-intermediate';
      case 'advanced': return 'skill-advanced';
      default: return 'skill-all';
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
          <Button 
            to={`/activities/${activity.id}`} 
            disabled={activity.is_full}
            className="w-100 mt-2"
          >
            {activity.is_full ? 'Session Full' : 'Join Game'}
          </Button>
        </Col>
      </Card.Body>
    </Card>
  );
};

export default ActivityCard;