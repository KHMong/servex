import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Spinner, Alert } from 'react-bootstrap';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import BarChart from '../../components/specific/charts/BarChart';

const StatCard = ({ title, value }) => (
  <Card className="border-0 shadow-sm p-1 h-100">
    <Card.Body>
      <div className="text-muted fw-semibold fs-5">{title}</div>
      <div className="fs-1 fw-bold">{value}</div>
    </Card.Body>
  </Card>
);

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter State
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [filterType, setFilterType] = useState('all_time'); // All Time/Month/Year

  useEffect(() => {
    setLoading(true);
    apiClient.get(`/admin/dashboard?year=${year}&month=${month}&filter_type=${filterType}`)
      .then(res => setData(res.data))
      .catch(err => setError("Failed to load stats."))
      .finally(() => setLoading(false));
  }, [year, month, filterType]);

  // Month Names
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Year
  const startYear = 2025;
  const endYear = new Date().getFullYear() + 1;
  const years = Array.from(
    { length: endYear - startYear + 1 }, 
    (_, i) => startYear + i
  );

  if (loading) return <div className="text-center p-5"><Spinner animation="border" variant="success" /></div>;
  if (!data) return <p className="text-muted text-center m-0 p-3">No data available.</p>;

  // Current filter
  const getFilterLabel = () => {
    if (filterType === 'all_time') return '(All Time)';
    if (filterType === 'year') return `(${year})`;
    return `(${monthNames[month - 1]} ${year})`;
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Welcome back, {user?.name}!</h2>
        {error && <Alert variant="danger">{error}</Alert>}

        <div className="d-flex gap-2">
          <Form.Select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)} 
            style={{ width: '130px' }}
          >
            <option value="all_time">All Time</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </Form.Select>

          {filterType === 'month' && (
            <Form.Select 
              value={month} 
              onChange={(e) => setMonth(e.target.value)} 
              style={{ width: '100px' }}
            >
              {monthNames.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </Form.Select>
          )}

          {filterType !== 'all_time' && (
            <Form.Select 
                value={year} 
                onChange={(e) => setYear(e.target.value)} 
                style={{ width: '100px' }}
            >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
            </Form.Select>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="g-4 mb-5">
        <h5 className="fw-bold text-muted mb-0">Overview <small className="fw-normal">{getFilterLabel()}</small></h5>
        <Col md={4} xl><StatCard title="Total Players" value={data.stats.total_players} /></Col>
        <Col md={4} xl><StatCard title="Total Coaches" value={data.stats.total_coaches} /></Col>
        <Col md={4} xl><StatCard title="Total Organisers" value={data.stats.total_organisers} /></Col>
        <Col md={6} xl><StatCard title="Active Venues" value={data.stats.active_venues} /></Col>
        <Col md={6} xl><StatCard title="Total Bookings" value={data.stats.total_bookings} /></Col>
      </Row>

      {/* Pending Cards */}
      <Row className="g-4 mb-5">
        <h5 className="fw-bold text-muted mb-0">Pending <small className="fw-normal">(Current)</small></h5>
        <Col md={4}><StatCard title="Owner Registrations" value={data.stats.pending_owners} /></Col>
        <Col md={4}><StatCard title="Coaches Applications" value={data.stats.pending_coaches} /></Col>
        <Col md={4}><StatCard title="Venues Applications" value={data.stats.pending_venues} /></Col>
      </Row>

      {/* Charts */}
      <h5 className="mb-3 fw-bold text-muted">Yearly Trends <small className="fw-normal">({data.charts.year})</small></h5>
      <Row className="g-4">
        {/* New User Registrations */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm p-3 h-100">
            <Card.Title className="fw-bold mb-4">New User Registrations</Card.Title>
            <BarChart 
              labels={monthNames} 
              data={data.charts.new_users} 
              label="Users" 
            />
          </Card>
        </Col>

        {/* Total Bookings */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm p-3 h-100">
            <Card.Title className="fw-bold mb-4">Total Bookings</Card.Title>
            <BarChart 
              labels={monthNames} 
              data={data.charts.bookings} 
              label="Bookings" 
            />
          </Card>
        </Col>

        {/* Total Training Sessions */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm p-3 h-100">
            <Card.Title className="fw-bold mb-4">Total Training Sessions</Card.Title>
            <BarChart 
              labels={monthNames} 
              data={data.charts.training_sessions} 
              label="Sessions" 
            />
          </Card>
        </Col>

        {/* Total Tournaments */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm p-3 h-100">
            <Card.Title className="fw-bold mb-4">Total Tournaments</Card.Title>
            <BarChart 
              labels={monthNames} 
              data={data.charts.tournaments} 
              label="Tournaments" 
            />
          </Card>
        </Col>

        {/* Total Activities */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm p-3 h-100">
            <Card.Title className="fw-bold mb-4">Total Activities</Card.Title>
            <BarChart 
              labels={monthNames} 
              data={data.charts.activities} 
              label="Activities" 
            />
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default AdminDashboardPage;