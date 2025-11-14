import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Spinner, Card, Tabs, Tab } from 'react-bootstrap';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import apiClient from '../../api/apiClient';
import { getImageUrl } from '../../utils/imageUrl';
import Button from '../../components/common/Button';
import BackButton from '../../components/common/BackButton';
import '../../components/common/StatusTab.css';
import './tournaments/TournamentDetailsPage.css';

const TournamentDetailsPage = () => {
  const { tournamentId } = useParams();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    const fetchTournament = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/tournaments/${tournamentId}`);
        setTournament(response.data.data);
      } catch (err) {
        setError("Could not find tournament details.");
      } finally {
        setLoading(false);
      }
    };
    fetchTournament();
  }, [tournamentId]);

  if (loading) {
    return <div className="text-center p-5"><Spinner animation="border" variant="success" /></div>;
  }
  if (error) {
    return <p className="text-center text-danger p-5">{error}</p>;
  }
  if (!tournament) {
    return <p className="text-center text-muted p-5">No tournament found.</p>;
  }

  const imageUrl = getImageUrl(tournament.photo_path);

  return (
    <Container className="py-5">
      <BackButton to={`/tournaments/`} place="Tournaments"></BackButton>
      
      <div className="d-flex justify-content-center mb-3">
        <img src={imageUrl} alt={tournament.name} className="img-fluid rounded mb-4" style={{ maxHeight: '700px' }} />
      </div>
      

      <h1 className="fw-bold">{tournament.name}</h1>
      
      {/* Info */}
      <Row className="d-flex justify-content-between border gy-3 my-4 pt-1 p-3 bg-light rounded">
        <Col md={4} className="info-item">
            <FaCalendarAlt className="icon" />
            <span>{tournament.start_date_formatted} to {tournament.end_date_formatted}</span>
        </Col>
        <Col md={4} className="info-item">
            <FaMapMarkerAlt className="icon" />
            <span>{tournament.venue_address}, {tournament.state.name}</span>
        </Col>
        <Col md={4} className="info-item">
            <FaClock className="icon" />
            <span>Registration Deadline: {tournament.deadline_formatted}</span>
        </Col>
      </Row>
      
      <Row className="mt-5 gap-4 justify-content-between">
        {/* Tabs */}
        <Col lg={7}>
          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} id="tournament-info-tabs" className="mb-4 tournament-tabs">
            <Tab eventKey="description" title="Description">
              <p style={{ whiteSpace: 'pre-wrap' }}>{tournament.description}</p>
            </Tab>
            <Tab eventKey="prizes" title="Prizes">
              <p style={{ whiteSpace: 'pre-wrap' }}>{tournament.prize}</p>
            </Tab>
            <Tab eventKey="rules" title="Rules & Regulations">
              <p style={{ whiteSpace: 'pre-wrap' }}>{tournament.rule}</p>
            </Tab>
          </Tabs>
        </Col>
        
        {/* Registration Fees */}
        <Col lg={4}>
          <Card className="border shadow-sm">
            <Card.Body className="p-4">
              <h4 className="fw-semibold mb-3">Registration Fee</h4>
              {tournament.selected_categories?.map((cat, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center fee-item">
                  <span>{cat.name}</span>
                  <span className="fw-semibold">RM {cat.fee}</span>
                </div>
              ))}
              <Button to={`/tournaments/${tournament.id}/register`} className="w-100 mt-2">
                Register Now!
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TournamentDetailsPage;