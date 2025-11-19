import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/apiClient';

const StatCard = ({ title, value }) => (
  <Card className="border-0 shadow-sm p-1 h-100">
    <Card.Body>
      <div className="text-muted fw-semibold fs-5">{title}</div>
      <div className="fs-1 fw-bold">{value}</div>
    </Card.Body>
  </Card>
);

const CoachDashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    apiClient.get('/coach/dashboard')
      .then(res => setData(res.data))
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center p-5"><Spinner /></div>;
  if (!data) return <p>No data available.</p>;

  const { stats, upcoming_sessions } = data;

  return (
    <>
      <h2 className="mb-5 fw-bold">Welcome back, {user?.name}!</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Statistics */}
      <Row className="g-4">
        <Col><StatCard title="Total Active Trainees" value={stats.total_active_trainees} /></Col>
        <Col><StatCard title="Active Trainee Groups" value={stats.active_trainee_groups} /></Col>
        <Col><StatCard title="Sessions This Month" value={stats.sessions_this_month} /></Col>
        <Col><StatCard title="Overall Attendance Rate" value={stats.overall_attendance_rate} /></Col>
      </Row>

      {/* Upcoming Training Sessions */}
      <h3 className="mt-5 mb-3 fw-bold">Upcoming Training Sessions</h3>
      <div className="d-flex flex-column gap-4">
          {upcoming_sessions.data.length > 0 ? (
            upcoming_sessions.data.map(session => (
            <Card className="border-0 shadow-sm">
                <Card.Body>
                <div key={session.id} className="d-flex justify-content-between align-items-center p-2">
                    <div className="d-flex flex-column gap-2">
                        <h5 className="mb-0 fw-semibold">{session.name}</h5>
                        <small className="text-muted fs-6">
                            {session.group_name} | {session.full_date} ({session.time_range})
                        </small>
                    </div>
                </div>
                </Card.Body>
            </Card>
            ))
          ) : <p className="text-muted text-center m-0 p-3">No upcoming training sessions found.</p>}
      </div>
        
      {/* Pagination for upcoming sessions can be added here if needed */}
    </>
  );
};

export default CoachDashboardPage;