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

const OwnerDashboardPage = () => {
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
    apiClient.get(`/owner/dashboard?year=${year}&month=${month}&filter_type=${filterType}`)
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

  // Hours
  const hoursLabels = Array.from({ length: 24 }, (_, i) => {
    const h = i % 12 || 12;
    const ampm = i < 12 ? 'am' : 'pm';
    return `${h}${ampm}`;
  });

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
      <h5 className="fw-bold text-muted mb-3">Overview <small className="fw-normal">{getFilterLabel()}</small></h5>
      <Row className="g-4 mb-5">
        <Col md={6} xl={3}>
          <StatCard title="Total Revenue (RM)" value={data.stats.total_revenue} />
        </Col>
        <Col md={6} xl={3}>
          <StatCard title="Total Bookings" value={data.stats.total_bookings} />
        </Col>
        <Col md={6} xl={3}>
          <StatCard title="Avg. Booking Value" value={`RM ${data.stats.avg_booking_value}`} />
        </Col>
        <Col md={6} xl={3}>
          <StatCard title="Busiest Day" value={data.stats.busiest_day} />
        </Col>
      </Row>

      {/* Charts */}
      <Row className="g-4">
        {/* Peak Hours */}
        <Col lg={12}>
          <Card className="border-0 shadow-sm p-3">
            <Card.Title className="fw-bold mb-4">Peak Booking Hours {getFilterLabel()}</Card.Title>
            <BarChart 
              labels={hoursLabels} 
              data={data.charts.peak_hours} 
              label="Bookings"
            />
          </Card>
        </Col>

        {/* Revenue by Venue */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm p-3">
            <Card.Title className="fw-bold mb-4">Revenue by Venue {getFilterLabel()}</Card.Title>
            <BarChart 
              labels={data.charts.revenue_by_venue.labels} 
              data={data.charts.revenue_by_venue.data} 
              label="Revenue (RM)" 
            />
          </Card>
        </Col>

        {/* Revenue by Month */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm p-3">
            <Card.Title className="fw-bold mb-4">Revenue by Month ({data.charts.year})</Card.Title>
            <BarChart 
              labels={monthNames} 
              data={data.charts.revenue_by_month} 
              label="Revenue (RM)"
            />
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default OwnerDashboardPage;