import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import apiClient from '../../api/apiClient';

import CoachSearchFilter from './coaches/CoachSearchFilter';
import CoachCard from '../../components/specific/CoachCard';
import Pagination from '../../components/common/Pagination';

const BrowseCoachesPage = () => {
  // State for data
  const [coaches, setCoaches] = useState([]);
  const [states, setStates] = useState([]);
  const [paginationData, setPaginationData] = useState(null);
  
  // State for filters
  const [filters, setFilters] = useState({ search: '', state_id: '' });
  const [activeFilters, setActiveFilters] = useState({ search: '', state_id: '' });
  const [currentPage, setCurrentPage] = useState(1);
  
  // State for UI feedback
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await apiClient.get('/states');
        setStates(response.data);
      } catch (err) {
        console.error("Failed to fetch states", err);
      }
    };
    fetchStates();
  }, []);

  // Fetch coaches when filters or page changes
  const fetchCoaches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        ...activeFilters
      });
      const response = await apiClient.get(`/coaches?${params.toString()}`);
      setCoaches(response.data.data);
      setPaginationData(response.data.meta);
    } catch (err) {
      setError('Failed to load coaches. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeFilters]);

  useEffect(() => {
    fetchCoaches();
  }, [fetchCoaches]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    setActiveFilters(filters);
  };
  
  // Handle page change
  const handlePageChange = (url) => {
    const pageNumber = new URL(url).searchParams.get('page');
    setCurrentPage(Number(pageNumber));
  };

  const renderContent = () => {
    if (loading) {
      return <div className="text-center p-5"><Spinner animation="border" variant="success" /></div>;
    }
    if (error) {
      return <p className="text-center text-danger p-5">{error}</p>;
    }
    if (coaches.length === 0) {
      return <p className="text-center text-muted p-5">No coaches found.</p>;
    }
    return (
      <Row xs={1} md={2} lg={4} className="g-4">
        {(coaches || []).map(coach => (
          <Col key={coach.id}>
            <CoachCard coach={coach} />
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <Container className="py-5">
      <h1 className="text-center display-4 fw-bold mt-5 mb-5">Find a Coach</h1>
      <CoachSearchFilter
        states={states}
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
      />
      <div className="text-muted my-4">
        {paginationData && paginationData.total > 0 &&
          `Showing ${paginationData.from}-${paginationData.to} of ${paginationData.total} results`
        }
      </div>
      
      {renderContent()}

      <div className="mt-5 d-flex justify-content-center">
        <Pagination paginationData={paginationData} onPageChange={handlePageChange} />
      </div>
    </Container>
  );
};

export default BrowseCoachesPage;