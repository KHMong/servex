import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Spinner, Alert } from 'react-bootstrap';

import apiClient from '../../api/apiClient';
import { useNotification } from '../../contexts/NotificationContext';
import Button from '../../components/common/Button';
import BackButton from '../../components/common/BackButton';
import FormField from '../../components/common/FormField';
import StarRatingInput from '../../components/common/StarRatingInput';

const EditReviewPage = () => {
  const { venueId, reviewId } = useParams();
  const navigate = useNavigate();

  const [venueName, setVenueName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  
  const [loading, setLoading]  = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { showNotification } = useNotification();

  // Fetch the existing review data
  useEffect(() => {
    const fetchReview = async () => {
      setLoading(true);
      try {
        // Fetch both the review and venue name
        const [reviewRes, venueRes] = await Promise.all([
          apiClient.get(`/reviews/${reviewId}`),
          apiClient.get(`/venues/${venueId}`),
        ]);
        
        const reviewData = reviewRes.data.data;
        setRating(reviewData.rating);
        setComment(reviewData.comment);
        setVenueName(venueRes.data.data.name);
        
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to submit review.');
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [reviewId, venueId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation
    if (rating === 0) {
      return setError("Rating is required.");
    } else if (!comment) {
    return setError("Comment is required.");
    }
    setError('');
    setSaving(true);

    try {
      await apiClient.post(`/reviews/${reviewId}`, {
        rating: rating,
        comment: comment,
        status: "Active",
      });

      // Show success notification
      showNotification('Review updated successfully.', 'success');
      
      // Navigate back to the Court Booking Page
      navigate(`/venues/${venueId}`);

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update review.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center p-5"><Spinner animation="border" /></div>;
  }

  return (
    <Container className="py-5 d-flex justify-content-center">
      <div style={{ width: '100%', maxWidth: '900px' }}>
        <BackButton to={`/venues/${venueId}`} place="Venue"></BackButton>
        <Card className="border shadow-sm">
          <Card.Body className="p-4 p-md-5">
            <h2 className="fw-bold">Edit Your Review</h2>
            <p className="text-muted">You are editing your review for <strong>{venueName || '...'}</strong></p>
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

              <Button type="submit" className="w-100 mt-3" disabled={saving}>
                {saving ? <div className="text-center"><Spinner animation="border" variant="success" /></div> : 'Save Changes'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default EditReviewPage;