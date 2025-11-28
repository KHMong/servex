import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Spinner, Alert } from 'react-bootstrap';

import apiClient from '../../api/apiClient';
import { useNotification } from '../../contexts/NotificationContext';
import Button from '../../components/common/Button';
import BackButton from '../../components/common/BackButton';
import FormField from '../../components/common/FormField';
import StarRatingInput from '../../components/common/StarRatingInput';

const WriteReviewPage = () => {
  const { venueId } = useParams();
  const navigate = useNavigate();

  const [venueName, setVenueName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { showNotification } = useNotification();

  // Fetch the venue name
  useEffect(() => {
    apiClient.get(`/venues/${venueId}`)
      .then(res => setVenueName(res.data.data.name))
      .catch(err => setError("Could not load venue information."));
  }, [venueId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation
    if (rating === 0) {
      return setError("Rating is required.");
    } else if (!comment) {
    return setError("Comment is required.");
    }
    setError('');
    setLoading(true);

    try {
      await apiClient.post('/reviews', {
        venue_id: venueId,
        rating: rating,
        comment: comment,
      });

      // Show success notification
      showNotification('Review submitted successfully.', 'success');
      
      // Navigate back to the Court Booking Page
      navigate(`/venues/${venueId}`);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5 d-flex justify-content-center">
      <div style={{ width: '100%' }}>
        <BackButton to={`/venues/${venueId}`} place="Venue"></BackButton>
        <Card className="border shadow-sm">
          <Card.Body className="p-4 p-md-5">
            <h2 className="fw-bold">Write a Review</h2>
            <p className="text-muted">You are reviewing <strong>{venueName || '...'}</strong>.</p>
            <hr className="my-4" />
            
            <Form onSubmit={handleSubmit}>
              {error && <Alert variant="danger">{error}</Alert>}

              <Form.Group className="mb-4">
                <Form.Label className="fw-medium">Your Rating <span className="text-danger"> *</span></Form.Label>
                <StarRatingInput rating={rating} onRatingChange={setRating} />
              </Form.Group>

              <FormField
                as="textarea"
                rows={7}
                label="Your Comment"
                name="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us about your experience. What did you like or dislike?"
                required
              />

              <Button type="submit" className="w-100 mt-3" disabled={loading}>
                {loading ? <div className="text-center"><Spinner animation="border" variant="success" /></div> : 'Submit Review'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default WriteReviewPage;