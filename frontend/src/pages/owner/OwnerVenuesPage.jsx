import React, { useState, useEffect, useCallback } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { FaSearch, FaPlus, FaTrash, FaEdit, FaTimes } from 'react-icons/fa';
import { GiTennisCourt } from "react-icons/gi";
import { MdOutlineCalendarToday, MdOutlineComment } from "react-icons/md";
import { useNavigate } from 'react-router-dom';

import apiClient from '../../api/apiClient';
import { useNotification } from '../../contexts/NotificationContext';
import Button from '../../components/common/Button';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';

import '../../components/common/SearchFilter.css';
import '../../components/common/Badge.css';

const OwnerVenuesPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [venues, setVenues] = useState([]);
  const [paginationData, setPaginationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
  const [filters, setFilters] = useState({ search: '', apply_status: '', status: '' });
  const [activeFilters, setActiveFilters] = useState({ search: '', apply_status: '', status: '' });
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch data
  const fetchVenues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: currentPage });
      Object.keys(activeFilters).forEach(key => {
        if (activeFilters[key]) params.append(key, activeFilters[key]);
      });

      const res = await apiClient.get(`/owner/venues?${params.toString()}`);
      setVenues(res.data.data);
      setPaginationData(res.data.meta);
    } catch (err) {
      setError("Failed to load venues.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeFilters]);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  // Handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setActiveFilters(filters);
  };

  const handleCancel = async (id) => {
    if (window.confirm("Are you sure you want to cancel this venue application?")) {
      try {
        await apiClient.delete(`/owner/venues/${id}/cancel`);
        showNotification("Venue application cancelled successfully.", "success");
        fetchVenues();
      } catch (err) {
        showNotification(err.response?.data?.message || "Failed to cancel venue application.", "error");
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this venue?")) {
      try {
        await apiClient.delete(`/owner/venues/${id}/delete`);
        showNotification("Venue deleted successfully.", "success");
        fetchVenues();
      } catch (err) {
        showNotification(err.response?.data?.message || "Failed to delete venue.", "error");
      }
    }
  };

  // Helper for Status Badges
  const renderStatusBadge = (status, type) => {
    let badgeClass = 'badge-default';
    
    if (status === 'Pending') badgeClass = 'badge-pending';
    else if (status === 'Approved') badgeClass = 'badge-approved';
    else if (status === 'Rejected') badgeClass = 'badge-rejected';
    else if (status === 'Cancelled') badgeClass = 'badge-cancelled';
    else if (status === 'Active') badgeClass = 'badge-active';
    else if (status === 'Inactive') badgeClass = 'badge-inactive';

    return <span className={`status-badge ${badgeClass}`}>{status}</span>;
  };

  const columns = [
    { 
      header: 'Venue Name', 
      accessor: 'name',
      cell: (row) => <span className="fw-bold">{row.name}</span>
    },
    { 
      header: 'State', 
      accessor: 'state' 
    },
    { 
      header: 'Total Courts', 
      accessor: 'total_courts',
      width: '15%'
    },
    { 
      header: 'Application Status', 
      accessor: 'apply_status',
      cell: (row) => renderStatusBadge(row.apply_status)
    },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (row) => renderStatusBadge(row.status)
    },
    {
      header: 'Actions',
      width: '200px',
      cell: (row) => {
        const isApproved = row.apply_status === 'Approved';
        const isPending = row.apply_status === 'Pending';

        return (
          <div className="d-flex gap-4">
            {/* Approved Actions */}
            {isApproved ? (
              <>
                {/* Manage Courts */}
                <span role="button" className="text-muted" title="Manage Courts" onClick={() => navigate(`/owner/venues/${row.id}/courts`)}>
                  <GiTennisCourt size={16} />
                </span>

                {/* Manage Bookings */}
                <span role="button" className="text-muted" title="Manage Bookings" onClick={() => navigate(`/owner/venues/${row.id}/bookings`)}>
                  <MdOutlineCalendarToday size={16} />
                </span>

                {/* View Reviews */}
                <span role="button" className="text-muted" title="View Reviews" onClick={() => navigate(`/owner/venues/${row.id}/reviews`)}>
                  <MdOutlineComment size={16} />
                </span>
              </>
            ) : (
              <>
                <span className="text-muted opacity-25" title="Cannot manage courts: Pending Application">
                  <GiTennisCourt size={16} />
                </span>

                <span className="text-muted opacity-25" title="Cannot manage bookings: Pending Application">
                  <MdOutlineCalendarToday size={16} />
                </span>

                <span className="text-muted opacity-25" title="Cannot view reviews: Pending Application">
                  <MdOutlineComment size={16} />
                </span>
              </>  
            )}

            {/* Edit Venue */}
            <span role="button" className="text-muted" title="Edit Venue" onClick={() => navigate(`/owner/venues/${row.id}/edit`)}>
                <FaEdit size={16} />
            </span>

            {isPending ? (
                // Cancel Venue Application
                <span role="button" className="text-danger" title="Cancel Venue Application" onClick={() => handleCancel(row.id)}>
                    <FaTimes size={16} />
                </span>
            ) : (
                // Delete Venue
                <span role="button" className="text-danger" title="Delete Venue" onClick={() => handleDelete(row.id)}>
                    <FaTrash size={16} />
                </span>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <>
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Venues</h2>
        <Button to="/owner/venues/create" icon={<FaPlus />}>
          Apply for New Venue
        </Button>
      </div>

      {/* Search Bar */}
      <Row className="mb-4">
        <Col md={12}>
          <div className="search-filter-wrapper flex-md-row">
            {/* Application Status Filter */}
            <Form.Select 
              name="apply_status" 
              value={filters.apply_status} 
              onChange={handleFilterChange}
              className="search-select"
              style={{ maxWidth: '250px' }}
            >
              <option value="">All Application Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </Form.Select>

            {/* Status Filter */}
            <Form.Select 
              name="status" 
              value={filters.status} 
              onChange={handleFilterChange}
              className="search-select"
              style={{ maxWidth: '150px' }}
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Form.Select>

            {/* Search Input */}
            <Form.Control
              type="text"
              name="search"
              placeholder="Search by venue name..."
              className="search-input"
              value={filters.search}
              onChange={handleFilterChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
            />

            {/* Search Button */}
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

      {/* Table */}
      <DataTable 
        columns={columns} 
        data={venues} 
        loading={loading} 
        error={error}
        emptyMessage="No venues found."
      />

      {/* Pagination */}
      <div className="mt-5 d-flex justify-content-center">
        <Pagination 
          paginationData={paginationData} 
          onPageChange={(url) => setCurrentPage(Number(new URL(url).searchParams.get('page')))} 
        />
      </div>
    </>
  );
};

export default OwnerVenuesPage;