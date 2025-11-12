import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../../../api/apiClient';
import ReviewCard from '../../../components/specific/ReviewCard';
import Pagination from '../../../components/common/Pagination';
import Button from '../../../components/common/Button';
import { Spinner } from 'react-bootstrap';

const ReviewsSection = ({ venueId, userReviewId }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [reviews, setReviews] = useState([]);
  const [paginationData, setPaginationData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/venues/${venueId}/reviews?page=${currentPage}`);
        setReviews(res.data.data);
        setPaginationData(res.data.meta);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [venueId, currentPage]);

  // Handle page change
  const handlePageChange = (url) => {
    const pageNumber = new URL(url).searchParams.get('page');
    setCurrentPage(Number(pageNumber));
  };

  console.log(userReviewId);

  const renderReviewButton = () => {
    // 1. Not logged in (Navigate to login)
    if (!isAuthenticated) {
      return (
        <Button 
          variant="tertiary"
          onClick={() => navigate('/login', { state: { from: location } })}
        >
          Write a Review
        </Button>
      );
    }

    // 2. Not Player (Don't show)
    if (user?.role !== 'Player') {
      return null;
    }
    
    // 3. If review this venue before, show the 'Edit Review' button
    if (userReviewId) {
      return (
        <Button 
          to={`/venues/${venueId}/review/${userReviewId}/edit`} 
          variant="tertiary"
        >
          Edit Your Review
        </Button>
      );
    }

    // 4. Otherwise, show the 'Write a Review' button
    return (
      <Button 
        to={`/venues/${venueId}/review/create`}
        variant="tertiary"
      >
        Write a Review
      </Button>
    );
  };

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-semibold">Reviews & Ratings</h2>
        {renderReviewButton()}
      </div>
      {loading ? <Spinner /> : (
        reviews.length > 0 ? (
          <>
            {reviews.map(review => <ReviewCard key={review.id} review={review} />)}
            <div className="mt-5 d-flex justify-content-center">
              <Pagination paginationData={paginationData} onPageChange={handlePageChange} />
            </div>
          </>
        ) : <p>No reviews yet. Be the first to write one!</p>
      )}
    </section>
  );
};

export default ReviewsSection;