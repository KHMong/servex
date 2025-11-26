import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Row, Col } from 'react-bootstrap';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

import apiClient from '../../../api/apiClient';
import { useNotification } from '../../../contexts/NotificationContext';
import BackButton from '../../../components/common/BackButton';
import Button from '../../../components/common/Button';
import DataTable from '../../../components/common/DataTable';
import Pagination from '../../../components/common/Pagination';
import CourtFormModal from './CourtFormModal';
import '../../../components/common/SearchFilter.css';
import '../../../components/common/Badge.css';

const VenueCourtsPage = () => {
  const { venueId } = useParams();
  const { showNotification } = useNotification();

  const [venueName, setVenueName] = useState('');
  const [courts, setCourts] = useState([]);
  const [paginationData, setPaginationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter State
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [activeFilters, setActiveFilters] = useState({ search: '', status: '' });
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch Data
  const fetchCourts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage, ...activeFilters });
      const res = await apiClient.get(`/owner/venues/${venueId}/courts?${params.toString()}`);
      
      setCourts(res.data.data);
      setPaginationData(res.data.meta);
      if (res.data.venue_name) setVenueName(res.data.venue_name);
    } catch (err) {
      setError("Failed to load courts.");
    } finally {
      setLoading(false);
    }
  }, [venueId, currentPage, activeFilters]);

  useEffect(() => {
    fetchCourts();
  }, [fetchCourts]);

  // Handlers
  const handleFilterChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setActiveFilters(filters);
  };

  // Open Modal
  const handleOpenModal = (court = null) => {
    setSelectedCourt(court);
    setShowModal(true);
  };

  // Form Submit
  const handleFormSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (selectedCourt) {
        // Edit Mode
        await apiClient.put(`/owner/courts/${selectedCourt.id}`, formData);
        showNotification("Court updated successfully.", "success");
      } else {
        // Add Mode
        await apiClient.post(`/owner/venues/${venueId}/courts`, formData);
        showNotification("Court added successfully.", "success");
      }
      setShowModal(false);
      fetchCourts();
    } catch (err) {
      showNotification(err.response?.data?.message || "Failed to add/update court.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Court
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this court?")) {
      try {
        await apiClient.delete(`/owner/courts/${id}`);
        showNotification("Court deleted successfully.", "success");
        fetchCourts();
      } catch (err) {
        showNotification(err.response?.data?.message || "Failed to delete court.", "error");
      }
    }
  };

  const renderStatusBadge = (status) => {
    let badgeClass = 'badge-default';
    
    if (status === 'Available') badgeClass = 'badge-available';
    else if (status === 'Maintenance') badgeClass = 'badge-maintenance';

    return <span className={`status-badge ${badgeClass}`}>{status}</span>;
  };

  const columns = [
    { header: 'Court Name', accessor: 'name', cell: (row) => <span className="fw-bold">{row.name}</span> },
    { header: 'Status', accessor: 'status', cell: (row) => renderStatusBadge(row.status) },
    {
      header: 'Actions',
      width: '150px',
      cell: (row) => (
        <div className="d-flex gap-3">
          <span role="button" className="text-muted" onClick={() => handleOpenModal(row)} title="Edit Court">
            <FaEdit size={16} />
          </span>
          <span role="button" className="text-danger" onClick={() => handleDelete(row.id)} title="Delete Court">
            <FaTrash size={16} />
          </span>
        </div>
      )
    }
  ];

  return (
    <>
      <BackButton to="/owner/venues" place="Venues" />
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">{venueName}</h2>
        <Button onClick={() => handleOpenModal(null)} icon={<FaPlus />}>Add New Court</Button>
      </div>

      <Row className="mb-4">
        <Col md={12}>
          <div className="search-filter-wrapper flex-md-row">
            <Form.Select 
              name="status" 
              value={filters.status} 
              onChange={handleFilterChange}
              className="search-select"
              style={{ maxWidth: '200px' }}
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Maintenance">Maintenance</option>
            </Form.Select>

            <Form.Control
              type="text"
              name="search"
              placeholder="Search by court name..."
              className="search-input"
              value={filters.search}
              onChange={handleFilterChange}
            />

            <Button onClick={handleSearch} icon={<FaSearch />}>Search</Button>
          </div>
        </Col>
      </Row>

      {!loading && (
        <div className="text-muted my-3">
            {paginationData && paginationData.total > 0 &&
            `Showing ${paginationData.from}-${paginationData.to} of ${paginationData.total} results`
            }
        </div>
      )}

      <DataTable 
        columns={columns} 
        data={courts} 
        loading={loading} 
        error={error}
        emptyMessage="No courts found."
      />

      <div className="mt-5 d-flex justify-content-center">
        <Pagination 
          paginationData={paginationData} 
          onPageChange={(url) => setCurrentPage(Number(new URL(url).searchParams.get('page')))} 
        />
      </div>

      {/* Add/Edit Modal */}
      <CourtFormModal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        onSubmit={handleFormSubmit} 
        courtToEdit={selectedCourt}
        submitting={submitting}
      />
    </>
  );
};

export default VenueCourtsPage;