import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Row, Col, Form, Alert, Spinner } from 'react-bootstrap';

import apiClient from '../../../api/apiClient';
import BackButton from '../../../components/common/BackButton';
import ReviewCard from '../../../components/specific/ReviewCard';
import Pagination from '../../../components/common/Pagination';
import { useNotification } from '../../../contexts/NotificationContext';
import '../../../components/common/SearchFilter.css';

const StatCard = ({ title, value }) => (
  <Card className="border-0 shadow-sm p-1 h-100">
    <Card.Body>
      <div className="text-muted fw-semibold fs-5">{title}</div>
      <h2 className="fs-1 fw-bold">{value}</h2>
    </Card.Body>
  </Card>
);

const VenueReviewsPage = () => {
  const { venueId } = useParams();
  const { showNotification } = useNotification();

  const [venueName, setVenueName] = useState('');
  const [stats, setStats] = useState({ average_rating: 0, total_reviews: 0 });
  const [reviews, setReviews] = useState([]);
  const [paginationData, setPaginationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [filters, setFilters] = useState({ rating: 'All', sort: 'Latest' });
  const [currentPage, setCurrentPage] = useState(1);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ 
        page: currentPage, 
        rating: filters.rating,
        sort: filters.sort 
      });
      
      const res = await apiClient.get(`/owner/venues/${venueId}/reviews?${params.toString()}`);
      
      setReviews(res.data.data);
      setPaginationData(res.data.meta);
      if (res.data.venue_name) setVenueName(res.data.venue_name);
      if (res.data.stats) setStats(res.data.stats);

    } catch (err) {
      setError("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }, [venueId, currentPage, filters, showNotification]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setCurrentPage(1); // Reset
  };

  return (
    <>
      <BackButton to="/owner/venues" place="Venues" />
      
      <h2 className="fw-bold mb-4">{venueName}</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Stats Cards */}
      <Row className="g-4 mb-5">
        <Col md={6}>
          <StatCard title="Average Rating" value={`${stats.average_rating} / 5`} />
        </Col>
        <Col md={6}>
          <StatCard title="Total Reviews" value={stats.total_reviews} />
        </Col>
      </Row>

      {/* Filters */}
      <div className="d-flex gap-3">
        <div className="d-flex flex-column">
            <label className="small text-muted mb-1 ms-1">Ratings</label>
            <Form.Select 
                name="rating" 
                value={filters.rating}
                onChange={handleFilterChange}
                style={{ width: '150px' }}
            >
                <option value="All">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
            </Form.Select>
        </div>
        <div className="d-flex flex-column">
            <label className="small text-muted mb-1 ms-1">Sort By</label>
            <Form.Select 
                name="sort" 
                value={filters.sort} 
                onChange={handleFilterChange}
                style={{ width: '150px' }}
            >
                <option value="Latest">Latest</option>
                <option value="Oldest">Oldest</option>
            </Form.Select>
        </div>
      </div>

      {/* Review List */}
      {loading ? (
        <div className="text-center p-5"><Spinner animation="border" variant="success" /></div>
      ) : reviews.length > 0 ? (
        <>
            <div className="text-muted my-3">
                {paginationData && paginationData.total > 0 &&
                `Showing ${paginationData.from}-${paginationData.to} of ${paginationData.total} results`
                }
            </div>

            {reviews.map(review => <ReviewCard key={review.id} review={review} />)}

            <div className="mt-5 d-flex justify-content-center">
                <Pagination 
                    paginationData={paginationData} 
                    onPageChange={(url) => setCurrentPage(Number(new URL(url).searchParams.get('page')))} 
                />
            </div>
        </>
      ) : (
        <p className="text-muted text-center p-5">No reviews found.</p>
      )}

      
    </>
  );
};

export default VenueReviewsPage;