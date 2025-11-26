import React from 'react';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';
import { Card } from 'react-bootstrap';
import '../common/Badge.css';

const PlayerSessionCard = ({ session, isCompleted }) => {
  return (
    <Card className="mb-4 shadow-sm border">
      <Card.Body className="d-flex align-items-center">
        {/* Datetime */}
        <div className="date-block-training me-4" style={{ minWidth: '140px' }}>
          <div className="fw-bold text-dark"><FaCalendarAlt className="me-1" /> {session.date_day}, {session.date_full}</div>
          <div className="text-muted small fw-semibold"><FaClock className="me-1" /> {session.time_range}</div>
        </div>

        {/* Divider */}
        <div className="vr me-4 d-none d-md-block" style={{ height: '120px', opacity: 0.2 }}></div>

        {/* Content */}
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h5 className="fw-bold mb-1">{session.session_name}</h5>
              <p>{session.session_description}</p>
              <div className="text-muted small mb-0">
                <p className="mb-1"><strong>Group:</strong> {session.group_name} </p>
                <p className="mb-0"><strong>Coach:</strong> {session.coach_name} </p>
              </div>
            </div>
            
            {/* Completed */}
            {isCompleted && (
              <span className={`status-badge-sm ${session.attendance_status === 'Pending' ? 'status-pending' : session.attendance_status === 'Present' ? 'status-present' : 'status-absent'}`}>
                {session.attendance_status}
              </span>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PlayerSessionCard;