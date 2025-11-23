import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, ListGroup, Alert } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/apiClient';
import Pagination from '../../components/common/Pagination';

const StatCard = ({ title, value }) => (
  <Card className="border-0 shadow-sm p-1 h-100">
    <Card.Body>
      <div className="text-muted fw-semibold fs-5">{title}</div>
      <div className="fs-1 fw-bold">{value}</div>
    </Card.Body>
  </Card>
);

const OrganiserDashboardPage = () => {
  const { user } = useAuth();

  // Stats & Recent Registrations
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [statsError, setStatsError] = useState('');

  // Tournament List
  const [tournamentsData, setTournamentsData] = useState(null);
  const [loadingTournaments, setLoadingTournaments] = useState(true);
  const [tournamentsError, setTournamentsError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch Stats & Recent Registrations
  useEffect(() => {
    apiClient.get('/organiser/dashboard/stats')
      .then(res => setDashboardData(res.data))
      .catch(() => setStatsError("Failed to load dashboard statistics."))
      .finally(() => setLoadingData(false));
  }, []);

  // Fetch Tournaments List
  useEffect(() => {
    setLoadingTournaments(true);
    apiClient.get(`/organiser/dashboard/tournaments-stats?page=${currentPage}`)
      .then(res => setTournamentsData(res.data))
      .catch(() => setTournamentsError("Failed to load tournament list."))
      .finally(() => setLoadingTournaments(false));
  }, [currentPage]);

  return (
    <>
      <h2 className="mb-5 fw-bold">Welcome back, {user?.name}!</h2>

      {statsError && <Alert variant="danger">{statsError}</Alert>}

      {/* Statistics */}
      {loadingData ? (
        <div className="text-center p-5"><Spinner /></div>
      ) : (
        dashboardData ? (
          <Row className="g-4 mb-5">
            <Col md={6} xl={3}><StatCard title="Total Tournaments Hosted" value={dashboardData.stats.total_hosted} /></Col>
            <Col md={6} xl={3}><StatCard title="Pending Registrations" value={dashboardData.stats.pending_registrations} /></Col>
            <Col md={6} xl={3}><StatCard title="Total Approved Participants" value={dashboardData.stats.total_participants} /></Col>
            <Col md={6} xl={3}><StatCard title="Upcoming Tournaments" value={dashboardData.stats.upcoming_tournaments} /></Col>
          </Row>
        ) : (
            <p className="text-muted text-center m-0 p-3">No data available.</p>
        )
      )}

      <Row className="g-4">
        {/* Recent Registrations */}
        <Col lg={6}>
          <h4 className="fw-bold mb-3">Recent Registrations</h4>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-0">
              {loadingData ? (
                <div className="text-center p-4"><Spinner animation="border" variant="success" /></div>
              ) : (
                <ListGroup variant="flush">
                  {dashboardData?.recent_registrations.length > 0 ? (
                    dashboardData.recent_registrations.map(reg => (
                      <ListGroup.Item key={reg.id} className="py-3 px-4 border-bottom">
                        <span className="fw-bold">{reg.player_name}</span> registered for <span className="text-muted fw-semibold">{reg.tournament_name}</span>.
                      </ListGroup.Item>
                    ))
                  ) : (
                    <div className="text-center p-4 text-muted">No recent registrations.</div>
                  )}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Registrations by Tournament */}
        <Col lg={6}>
          <h4 className="fw-bold mb-3">Registrations by Tournament</h4>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-0 d-flex flex-column">
              {loadingTournaments ? (
                <div className="text-center p-4"><Spinner animation="border" variant="success" /></div>
              ) : (
                <>
                  {tournamentsError && <Alert variant="danger">{tournamentsError}</Alert>}
                  <ListGroup variant="flush" className="flex-grow-1">
                    {tournamentsData?.data.length > 0 ? (
                      tournamentsData.data.map(t => (
                        <ListGroup.Item key={t.id} className="py-3 px-4 d-flex justify-content-between align-items-center border-bottom">
                          <span className="fw-medium">{t.name}</span>
                          <span className="fw-bold fs-5">{t.registrations_count}</span>
                        </ListGroup.Item>
                      ))
                    ) : (
                      <div className="text-center p-4 text-muted">No tournaments found.</div>
                    )}
                  </ListGroup>
                  
                  {/* Pagination */}
                  {tournamentsData?.data.length > 10 && (
                    <div className="p-3 border-top d-flex justify-content-center">
                      <Pagination 
                        paginationData={tournamentsData}
                        onPageChange={(url) => setCurrentPage(Number(new URL(url).searchParams.get('page')))}
                      />
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default OrganiserDashboardPage;