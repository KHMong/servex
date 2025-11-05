import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import apiClient from '../../api/apiClient';

import TournamentSearchFilter from './tournaments/TournamentSearchFilter';
import TournamentCard from '../../components/specific/TournamentCard';
import Pagination from '../../components/common/Pagination';

const BrowseTournamentsPage = () => {
  // State for data
  const [tournaments, setTournaments] = useState([]);
  const [states, setStates] = useState([]);
  const [paginationData, setPaginationData] = useState(null);
  
  // State for filters
  const [filters, setFilters] = useState({ search: '', state_id: '', date: '' });
  const [activeFilters, setActiveFilters] = useState({ search: '', state_id: '', date: '' });
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

  // Fetch tournaments when filters or page changes
  const fetchTournaments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        ...activeFilters
      });
      const response = await apiClient.get(`/tournaments?${params.toString()}`);
      setTournaments(response.data.data);
      setPaginationData(response.data.meta);
    } catch (err) {
      setError('Failed to load tournaments. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeFilters]);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

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
    if (tournaments.length === 0) {
      return <p className="text-center text-muted p-5">No tournaments found.</p>;
    }
    return (
      <Row xs={1} md={2} lg={3} className="g-4">
        {(tournaments || []).map(tournament => (
          <Col key={tournament.id}>
            <TournamentCard tournament={tournament} />
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <Container className="py-5">
      <h1 className="text-center display-4 fw-bold mt-5 mb-5">Find a Tournament</h1>
      <TournamentSearchFilter
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

export default BrowseTournamentsPage;