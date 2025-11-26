import React, { useState, useEffect, useCallback } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { VscCodeReview } from "react-icons/vsc";
import { useNavigate } from 'react-router-dom';

import apiClient from '../../../api/apiClient';
import Button from '../../../components/common/Button';
import DataTable from '../../../components/common/DataTable';
import Pagination from '../../../components/common/Pagination';

import '../../../components/common/SearchFilter.css';
import '../../../components/common/Badge.css';

const VenueApplicationsPage = () => {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [paginationData, setPaginationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter state
  const [filters, setFilters] = useState({ search: '', apply_status: '' });
  const [activeFilters, setActiveFilters] = useState({ search: '', apply_status: '' });
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch data
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: currentPage });
      if (activeFilters.apply_status) params.append('apply_status', activeFilters.apply_status);
      if (activeFilters.search) params.append('search', activeFilters.search);

      const res = await apiClient.get(`/admin/venue-applications?${params.toString()}`);
      setApplications(res.data.data);
      setPaginationData(res.data.meta);
    } catch (err) {
      setError("Failed to load venue applications.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeFilters]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

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

  // Helper for Status Badges
  const renderStatusBadge = (status) => {
    let badgeClass = 'badge-default';

    if (status === 'Pending') badgeClass = 'badge-pending'; 
    else if (status === 'Approved') badgeClass = 'badge-approved';
    else if (status === 'Rejected') badgeClass = 'badge-rejected';

    return <span className={`status-badge ${badgeClass}`}>{status}</span>;
  };

  const columns = [
    { header: 'Venue Name', accessor: 'venue_name', cell: (row) => <span className="fw-bold">{row.venue_name}</span> },
    { header: 'Owner Name', accessor: 'owner_name' },
    { header: 'Company', accessor: 'company_name' },
    { header: 'Date Submitted', accessor: 'date_submitted' },
    { header: 'Apply Status', cell: (row) => renderStatusBadge(row.apply_status) },
    {
      header: 'Actions',
      width: '100px',
      cell: (row) => (
        <div className="d-flex gap-3">
          <span 
            role="button" 
            className="text-muted" 
            title="Review Venue Application" 
            onClick={() => navigate(`/admin/venue-applications/${row.id}`)}
          >
            <VscCodeReview size={18} />
          </span>
        </div>
      )
    }
  ];

  return (
    <>
      <h2 className="fw-bold mb-4">Venue Application Management</h2>

      <Row className="mb-4">
        <Col md={12}>
            <div className="search-filter-wrapper flex-md-row">
                {/* Status Filter */}
                <Form.Select 
                    name="apply_status" 
                    value={filters.apply_status} 
                    onChange={handleFilterChange}
                    className="search-select"
                    style={{ maxWidth: '200px' }}
                >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                </Form.Select>

                {/* Search Input */}
                <Form.Control
                    type="text"
                    name="search"
                    placeholder="Search by venue, owner, company name..."
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

      <DataTable 
        columns={columns} 
        data={applications} 
        loading={loading} 
        error={error}
        emptyMessage="No venue applications found."
      />

      <div className="mt-5 d-flex justify-content-center">
        <Pagination 
          paginationData={paginationData} 
          onPageChange={(url) => setCurrentPage(Number(new URL(url).searchParams.get('page')))} 
        />
      </div>
    </>
  );
};

export default VenueApplicationsPage;