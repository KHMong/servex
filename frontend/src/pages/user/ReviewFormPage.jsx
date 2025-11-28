import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Spinner, Alert } from 'react-bootstrap';

import apiClient from '../../api/apiClient';
import { useNotification } from '../../contexts/NotificationContext';
import Button from '../../components/common/Button';
import BackButton from '../../components/common/BackButton';
import FormField from '../../components/common/FormField';
import StarRatingInput from '../../components/common/StarRatingInput';

const ReviewFormPage = ({ mode }) => {
  const { venueId, reviewId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const isEditMode = mode === 'edit';

  const [venueName, setVenueName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        if (isEditMode) {
          // Edit mode
          const [reviewRes, venueRes] = await Promise.all([
            apiClient.get(`/reviews/${reviewId}`),
            apiClient.get(`/venues/${venueId}`),
          ]);
          
          const reviewData = reviewRes.data.data;
          setRating(reviewData.rating);
          setComment(reviewData.comment);
          setVenueName(venueRes.data.data.name);
        } else {
          // Create mode
          const venueRes = await apiClient.get(`/venues/${venueId}`);
          setVenueName(venueRes.data.data.name);
        }
      } catch (err) {
        setError(isEditMode 
          ? "Failed to load review details." 
          : "Could not load venue information."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isEditMode, venueId, reviewId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (rating === 0) {
      return setError("Rating is required.");
    } else if (!comment) {
      return setError("Comment is required.");
    }

    setSubmitting(true);

    try {
      if (isEditMode) {
        // Update
        await apiClient.put(`/reviews/${reviewId}`, {
          rating: rating,
          comment: comment,
          status: "Active",
        });
        showNotification('Review updated successfully.', 'success');
      } else {
        // Create
        await apiClient.post('/reviews', {
          venue_id: venueId,
          rating: rating,
          comment: comment,
        });
        showNotification('Review submitted successfully.', 'success');
      }
      
      // Navigate back to the Court Booking Page
      navigate(`/venues/${venueId}`);

    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'submit'} review.`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center p-5"><Spinner animation="border" variant="success" /></div>;
  }

  return (
    <Container className="py-5 d-flex justify-content-center">
      <div style={{ width: '100%' }}>
        <BackButton to={`/venues/${venueId}`} place="Venue" />
        
        <Card className="border shadow-sm">
          <Card.Body className="p-4 p-md-5">
            <h2 className="fw-bold">
              {isEditMode ? 'Edit Your Review' : 'Write a Review'}
            </h2>
            <p className="text-muted">
              {isEditMode ? 'You are editing your review for ' : 'You are reviewing '}
              <strong>{venueName || '...'}</strong>.
            </p>
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

              <Button type="submit" className="w-100 mt-3" disabled={submitting}>
                {submitting ? (
                  <div className="text-center"><Spinner animation="border" variant="success" size="sm" /></div>
                ) : (
                  isEditMode ? 'Save Changes' : 'Submit Review'
                )}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default ReviewFormPage;