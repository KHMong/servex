import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Spinner, Alert, Card, Row, Col } from 'react-bootstrap';
import { FaArrowLeft, FaEnvelope, FaPhone, FaFileAlt } from 'react-icons/fa';
import apiClient from '../../api/apiClient';
import Button from '../../components/common/Button';
import BackButton from '../../components/common/BackButton';
import CertificateModal from './coaches/CertModal';
import { getImageUrl } from '../../utils/imageUrl';

const CoachProfilePage = () => {
  const { coachId } = useParams();
  const [coach, setCoach] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);

  useEffect(() => {
    const fetchCoach = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/coaches/${coachId}`);
        setCoach(response.data.data);
      } catch (err) {
        setError("Could not find coach profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchCoach();
  }, [coachId]);

  if (loading) {
    return <div className="text-center p-5"><Spinner animation="border" variant="success" /></div>;
  }
  if (error) {
    return <p className="text-center text-danger p-5">{error}</p>;
  }
  if (!coach) {
    return <p className="text-center text-muted p-5">No coach found.</p>;
  }

  const coachPhoto = getImageUrl(coach.photo_path);
  const certPath = getImageUrl(coach.cert_path);

  return (
    <>
      <Container className="py-5">
        <BackButton to={`/coaches/`} place="Coaches"></BackButton>
        
        <Card className="p-4 p-md-4 border shadow-sm">
          <Card.Body>
            {/* Profile Header */}
            <Row className="align-items-center gap-3">
              <Col md="auto">
                <img src={coachPhoto} alt={coach.name} className="rounded-circle" style={{ width: '180px', height: '180px', border: '3px solid var(--servex-light-gray-bg)'}} />
              </Col>
              <Col md>
                <h1 className="fw-bold mb-0">{coach.name}</h1>
                <p className="lead text-muted fw-normal">Based in {coach.state.name}</p>
                <h4 className="mt-3 fw-semibold">{coach.exp_year} Years of Experience</h4>
                <div className="d-flex flex-wrap text-muted mt-3 gap-2">
                  <div className="d-flex align-items-center me-4">
                    <FaEnvelope className="me-3" /> <span className="text-muted">{coach.email}</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <FaPhone className="me-3" /> <span className="text-muted">{coach.phone_no}</span>
                  </div>
                </div>
              </Col>
            </Row>

            <hr className="my-4" />

            {/* About Me Section */}
            <section className="mb-5">
              <h2 className="fw-bold mb-3">About Me</h2>
              <p style={{ whiteSpace: 'pre-wrap' }}>{coach.bio}</p>
            </section>

            {/* Certification Section */}
            <section>
              <h2 className="fw-bold mb-3">Certification</h2>
              {coach.cert_path ? (
                <Button 
                  variant="secondary" 
                  icon={<FaFileAlt />}
                  onClick={() => setShowCertModal(true)}
                >
                  View Certificate
                </Button>
              ) : (
                <p className="text-muted">No certification provided.</p>
              )}
            </section>
          </Card.Body>
        </Card>
      </Container>
      
      {/* Cert Modal */}
      <CertificateModal 
        show={showCertModal} 
        onHide={() => setShowCertModal(false)}
        certPath={certPath}
      />
    </>
  );
};

export default CoachProfilePage;