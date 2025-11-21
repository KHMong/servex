import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';
import Pagination from '../../components/common/Pagination';
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
  const [stats, setStats] = useState(null);
  const [sessionsData, setSessionsData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [statsError, setStatsError] = useState('');
  const [sessionsError, setSessionsError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient.get('/coach/dashboard'); 
        setStats(res.data.stats);
      } catch (error) {
        setStatsError("Failed to load stats.");
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoadingSessions(true);
      try {
        const res = await apiClient.get(`/coach/dashboard/upcoming-sessions?page=${currentPage}`);
        setSessionsData(res.data);
      } catch (error) {
        setSessionsError("Failed to load sessions.");
      } finally {
        setLoadingSessions(false);
      }
    };
    fetchSessions();
  }, [currentPage]);

  const handlePageChange = (url) => {
    const pageNumber = new URL(url).searchParams.get('page');
    setCurrentPage(Number(pageNumber));
  };

  return (
    <>
      <h2 className="mb-5 fw-bold">Welcome back, {user?.name}!</h2>

      {statsError && <Alert variant="danger">{statsError}</Alert>}

      {/* Statistics */}
      {loadingStats ? (
        <div className="text-center p-5"><Spinner /></div>
      ) : (
      stats ? (
      <Row className="g-4">
        <Col><StatCard title="Total Active Trainees" value={stats.total_active_trainees} /></Col>
        <Col><StatCard title="Active Trainee Groups" value={stats.active_trainee_groups} /></Col>
        <Col><StatCard title="Sessions This Month" value={stats.sessions_this_month} /></Col>
        <Col><StatCard title="Overall Attendance Rate" value={stats.overall_attendance_rate} /></Col>
      </Row>
      ) : (
        <p className="text-muted text-center m-0 p-3">No data available.</p>
      )
      )}

      {/* Upcoming Training Sessions */}
      <h3 className="mt-5 mb-3 fw-bold">Upcoming Training Sessions</h3>
      <div className="d-flex flex-column gap-4">
        {sessionsError && <Alert variant="danger">{sessionsError}</Alert>}
        {loadingSessions ? (
            <div className="text-center p-5"><Spinner /></div>
          ) : (
          <>
            {sessionsData && sessionsData.data.length > 0 ? (
              sessionsData.data.map(session => (
              <Card className="border-0 shadow-sm">
                  <Card.Body>
                  <div key={session.id} className="d-flex justify-content-between align-items-center p-2">
                      <div className="d-flex flex-column gap-2">
                          <h5 className="mb-0 fw-semibold">{session.name}</h5>
                          <small className="text-muted fs-6">
                              {session.group_name} 
                              <span className="mx-2">|</span> 
                              <FaCalendarAlt className="me-1" /> {session.full_date} 
                              <span className="mx-2">|</span> 
                              <FaClock className="me-1" /> {session.time_range}
                          </small>
                      </div>
                  </div>
                  </Card.Body>
              </Card>
              ))
            ) : (<p className="text-muted text-center m-0 p-3">No upcoming training sessions found.</p>)}
          </>
        )}
      </div>
      
      {!loadingSessions && sessionsData && (
      <div className="mt-5 d-flex justify-content-center">
        <Pagination paginationData={sessionsData} onPageChange={handlePageChange} />
      </div>
      )}
    </>
  );
};

export default CoachDashboardPage;