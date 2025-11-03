import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import BackButton from '../../components/common/BackButton';
import apiClient from '../../api/apiClient';

// Section components
import ImageSlide from './court-booking/ImageSlide';
import VenueHeader from './court-booking/VenueHeader';
import BookingForm from './court-booking/BookingForm';
import VenueInfoCard from './court-booking/VenueInfoCard';
import ReviewsSection from './court-booking/ReviewsSection';

const CourtBookingPage = () => {
  // Get ID from URL
  const { venueId } = useParams();
  
  const [venue, setVenue] = useState(null);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVenueDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const [venueRes, courtsRes] = await Promise.all([
          apiClient.get(`/venues/${venueId}`),
          apiClient.get(`/venues/${venueId}/courts`),
        ]);
        setVenue(venueRes.data.data);
        setCourts(courtsRes.data);
      } catch (err) {
        setError('Could not fetch venue details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVenueDetails();
  }, [venueId]); // Refetch if ID in the URL changes

  if (loading) {
    return <div className="text-center p-5"><Spinner animation="border" variant="success" /></div>;
  }
  if (error) {
    return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;
  }
  if (!venue) {
    return <p className="text-center text-muted p-5">No venue details found.</p>;
  }

  return (
    <Container className="py-5">
      <BackButton to={`/venues/`}></BackButton>

      <ImageSlide photos={venue.photos} />

      <Row className="mt-5">
        <Col lg={8}>
          <VenueHeader venue={venue} />
          <hr className="my-4" />
          <BookingForm venue={venue} courts={courts} />
          <hr className="my-4" />
          <ReviewsSection venueId={venue.id} />
        </Col>
        <Col lg={4}>
          <VenueInfoCard venue={venue} />
        </Col>
      </Row>
    </Container>
  );
};

export default CourtBookingPage;