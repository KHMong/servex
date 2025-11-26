import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Spinner, Alert, Image } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';

import apiClient from '../../../api/apiClient';
import { useNotification } from '../../../contexts/NotificationContext';
import BackButton from '../../../components/common/BackButton';
import Button from '../../../components/common/Button';
import { getImageUrl } from '../../../utils/imageUrl';
import '../../../components/common/Badge.css';

const DetailRow = ({ label, value }) => (
  <Col md={12} className="mb-4 d-flex flex-column gap-1">
    <div className="text-muted small text-uppercase fw-bold">{label}</div>
    <div className="fw-normal text-muted text-break">{value || '-'}</div>
  </Col>
);

const ReviewVenueApplicationPage = () => {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Fetch Data
  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const res = await apiClient.get(`/admin/venue-applications/${venueId}`);
        setVenue(res.data.data);
      } catch (err) {
        setError("Failed to load venue application details.");
      } finally {
        setLoading(false);
      }
    };
    fetchVenue();
  }, [venueId]);

  // Handlers
  const handleAction = async (status) => {
    if (!window.confirm(`Are you sure you want to set this application as ${status}?`)) return;

    setProcessing(true);
    try {
      await apiClient.put(`/admin/venue-applications/${venueId}/status`, { status });
      showNotification(`Venue application status updated successfully.`, "success");
      navigate('/admin/venue-applications');
    } catch (err) {
      showNotification(err.response?.data?.message || "Action failed.", "error");
    } finally {
      setProcessing(false);
    }
  };

  // Helper for Badges
  const renderBadge = (status) => {
    let badgeClass = 'badge-default';
    if (status === 'Pending') badgeClass = 'badge-pending';
    else if (status === 'Approved') badgeClass = 'badge-approved';
    else if (status === 'Rejected') badgeClass = 'badge-rejected';
    else if (status === 'Active') badgeClass = 'badge-active';
    else if (status === 'Inactive') badgeClass = 'badge-inactive';
    
    return <span className={`status-badge ${badgeClass}`}>{status}</span>;
  };

  if (loading) return <div className="text-center p-5"><Spinner animation="border" variant="success" /></div>;
  if (!venue) return <p className="text-center text-muted p-5">No application found.</p>;

  return (
    <>
      <BackButton to="/admin/venue-applications" place="Venue Application Management" />

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <Card className="border-0 shadow-sm p-4 mb-4">
        <Card.Body>
          <Row className="mb-5">
            {/* Venue Details */}
            <Col md={6} className="pe-5">
              <h4 className="fw-bold text-dark">Venue Details</h4>
              <hr className="my-3" />
              <Row>
                <DetailRow label="Venue Name" value={venue.name} />
                <DetailRow label="Address" value={venue.address} />
                <DetailRow label="State" value={venue.state} />
                <DetailRow label="Operating Hours" value={venue.operating_hours} />
                <DetailRow label="Phone Number" value={venue.phone_no} />
                <Col md={12} className="mb-4 d-flex gap-5">
                    <div>
                        <div className="text-muted small text-uppercase fw-bold mb-2">Apply Status</div>
                        {renderBadge(venue.apply_status)}
                    </div>
                    <div>
                        <div className="text-muted small text-uppercase fw-bold mb-2">Status</div>
                        {renderBadge(venue.status)}
                    </div>
                </Col>
              </Row>
            </Col>

            {/* Owner Details */}
            <Col md={6} className="ps-5">
              <h4 className="fw-bold text-dark">Owner Details</h4>
              <hr className="my-3" />
              <Row>
                <DetailRow label="Owner Name" value={venue.owner.name} />
                <DetailRow label="Company Name" value={venue.owner.company_name} />
                <DetailRow label="Business Registration Number" value={venue.owner.business_reg_no} />
                <Col md={12} className="mt-2">
                  <Button 
                    variant="secondary" 
                    className="w-100"
                    onClick={() => navigate(`/admin/users/${venue.owner.id}`)}
                  >
                    View Full User Profile &#8594;
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>

          {/* Venue Photos */}
          <h4 className="fw-bold text-dark mb-4">Venue Photos</h4>
          <hr className="my-3" />
          {venue.photos.length > 0 ? (
            <Row className="g-3">
              {venue.photos.map((photoUrl, index) => (
                <Col key={index} xs={6} md={4} lg={3}>
                  <Image 
                    src={getImageUrl(photoUrl)} 
                    alt={`Venue ${index + 1}`} 
                    className="w-100 rounded shadow-sm border"
                    style={{ height: '200px', objectFit: 'contain' }}
                  />
                </Col>
              ))}
            </Row>
          ) : (
            <p className="text-muted">No photos uploaded.</p>
          )}

        </Card.Body>
      </Card>

      {/* Action (Only appear when Pending) */}
      {venue.apply_status === 'Pending' && (
        <Card className="border-0 shadow-sm">
          <Card.Body className="d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0">Action</h5>
            <div className="d-flex gap-3">
              {processing ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <>
                    <Button 
                        onClick={() => handleAction('Approved')}
                        disabled={processing}
                        style={{ width: '150px' }}
                        icon={!processing ? <FaCheck /> : null}
                    >
                        Approve
                    </Button>
                    <Button 
                        variant="red" 
                        onClick={() => handleAction('Rejected')}
                        disabled={processing}
                        style={{ width: '150px' }}
                        icon={!processing ? <FaTimes /> : null}
                    >
                        Reject
                    </Button>
                </>
              )}
              
            </div>
          </Card.Body>
        </Card>
      )}
    </>
  );
};

export default ReviewVenueApplicationPage;