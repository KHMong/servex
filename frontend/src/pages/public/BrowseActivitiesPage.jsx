import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import Button from '../../components/common/Button';
import { FaPlus } from 'react-icons/fa';
import apiClient from '../../api/apiClient';

import ActivitySearchFilter from './activities/ActivitySearchFilter';
import ActivityCard from '../../components/specific/ActivityCard';
import Pagination from '../../components/common/Pagination';

const BrowseActivitiesPage = () => {
  // State for data
  const [activities, setActivities] = useState([]);
  const [states, setStates] = useState([]);
  const [skillLevels, setSkillLevels] = useState([]);
  const [paginationData, setPaginationData] = useState(null);
  
  // State for filters
  const [filters, setFilters] = useState({ search: '', state_id: '', skill_level_id: '', date: '' });
  const [activeFilters, setActiveFilters] = useState({ search: '', state_id: '', skill_level_id: '', date: '' });
  const [currentPage, setCurrentPage] = useState(1);
  
  // State for UI feedback
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        // Fetch both sets of data in parallel
        const [statesRes, skillLevelsRes] = await Promise.allSettled([
            apiClient.get('/states'),
            apiClient.get('/skill-levels')
        ]);

        setStates(statesRes.value.data);
        setSkillLevels(skillLevelsRes.value.data);
      } catch (err) {
        console.error("Failed to fetch filter data", err);
      }
    };
    fetchFilterData();
  }, []);

  // Fetch activities when filters or page changes
  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        ...activeFilters
      });
      const response = await apiClient.get(`/activities?${params.toString()}`);
      setActivities(response.data.data);
      setPaginationData(response.data.meta);
    } catch (err) {
      setError('Failed to load activities. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeFilters]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

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
    if (activities.length === 0) {
      return <p className="text-center text-muted p-5">No activities found.</p>;
    }
    return (
      <Row xs={1} md={1} lg={2} className="g-4">
        {(activities || []).map(activity => (
          <Col key={activity.id} xl={6}>
            <ActivityCard activity={activity} />
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <Container className="py-5">
      <div className="d-flex flex-column align-items-center mt-5 mb-5">
        <h1 className="text-center display-4 fw-bold mb-3">Join a Game</h1>
        <div>
          <Button to="/activities/create" icon={<FaPlus />}>Create an Activity</Button>
        </div>
      </div>

      <ActivitySearchFilter
        states={states}
        skillLevels={skillLevels}
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

export default BrowseActivitiesPage;