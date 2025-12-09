import React, { useState, useEffect, useCallback } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { FaSearch, FaCheck, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import apiClient from '../../../api/apiClient';
import { useNotification } from '../../../contexts/NotificationContext';
import Button from '../../../components/common/Button';
import DataTable from '../../../components/common/DataTable';
import Pagination from '../../../components/common/Pagination';
import { getImageUrl } from '../../../utils/imageUrl';
import ShowModal from '../../../components/common/ShowModal';

import '../../../components/common/SearchFilter.css';
import '../users/UserManagementPage.css';

const CoachApplicationsPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [applications, setApplications] = useState([]);
  const [paginationData, setPaginationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [showCertModal, setShowCertModal] = useState(false);
  const [certPath, setCertPath] = useState('');

  // Filter state
  const [filters, setFilters] = useState({ search: '', status: '', state_id: '' });
  const [states, setStates] = useState([]);
  const [activeFilters, setActiveFilters] = useState({ search: '', status: '', state_id: '' });
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch data
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await apiClient.get('/states');
        setStates(response.data);
      } catch (err) {
        showNotification("Failed to fetch states", "error");
      }
    };
    fetchStates();
  }, []);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: currentPage });
      if (activeFilters.status) params.append('status', activeFilters.status);
      if (activeFilters.search) params.append('search', activeFilters.search);
      if (activeFilters.state_id) params.append('state_id', activeFilters.state_id);

      const res = await apiClient.get(`/admin/coach-applications?${params.toString()}`);
      setApplications(res.data.data);
      setPaginationData(res.data.meta);
    } catch (err) {
      setError("Failed to load coach applications.");
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

  const handleStatusUpdate = async (id, status) => {
    if (!window.confirm(`Are you sure you want to set this application as ${status}?`)) return;

    try {
      await apiClient.put(`/admin/coach-applications/${id}/status`, { status });
      showNotification(`Coach application status updated successfully.`, "success");
      fetchApplications();
    } catch (err) {
      showNotification(err.response?.data?.message || "Action failed.", "error");
    }
  };

  const handleViewCert = (url) => {
    setCertPath(getImageUrl(url));
    setShowCertModal(true);
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
    { 
      header: 'Coach Name', 
      accessor: 'coach_name', 
      cell: (row) => (
        <span 
          role="button" 
          className="fw-semibold"
          style={{ color: "var(--servex-green)" }}
          onClick={() => navigate(`/admin/users/${row.user_id}`)}
        >
          {row.coach_name}
        </span>
      )
    },
    { header: 'Primary Coaching State', accessor: 'state' },
    { header: 'Experience (Years)', accessor: 'exp_year', width: '200px' },
    { 
      header: 'Certificate', 
      cell: (row) => row.cert_path ? (
        <span 
          role="button" 
          className="fw-semibold" 
          style={{ color: "var(--servex-blue)" }}
          onClick={() => handleViewCert(row.cert_path)}
        >
          View Cert
        </span>
      ) : <span className="text-muted">-</span>
    },
    { header: 'Date Submitted', accessor: 'date_submitted' },
    { header: 'Status', cell: (row) => renderStatusBadge(row.status) },
    {
      header: 'Actions',
      width: '120px',
      cell: (row) => (
        <div className="d-flex gap-2">
          {row.status === 'Pending' && (
            <>
              <Button 
                className="p-1 px-3"
                style={{ fontSize: '0.8rem' }}
                onClick={() => handleStatusUpdate(row.user_id, 'Approved')}
                title="Approve"
              >
                <FaCheck />
              </Button>
              <Button 
                variant="red"
                className="p-1 px-3"
                style={{ fontSize: '0.8rem' }}
                onClick={() => handleStatusUpdate(row.user_id, 'Rejected')}
                title="Reject"
              >
                <FaTimes />
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <>
      <h2 className="fw-bold mb-4">Coach Application Management</h2>

      <Row className="mb-4">
        <Col md={12}>
            <div className="search-filter-wrapper flex-md-row">
                {/* Status Filter */}
                <Form.Select 
                    name="status" 
                    value={filters.status} 
                    onChange={handleFilterChange}
                    className="search-select"
                    style={{ maxWidth: '200px' }}
                >
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                </Form.Select>

                {/* State Filter */}
                <Form.Select 
                  name="state_id" 
                  value={filters.state_id} 
                  onChange={handleFilterChange}
                  className="search-select"
                  style={{ maxWidth: '200px' }}
                >
                  <option value="">All States</option>
                  {states.map(state => (
                    <option key={state.id} value={state.id}>{state.name}</option>
                  ))}
                </Form.Select>

                {/* Search Input */}
                <Form.Control
                    type="text"
                    name="search"
                    placeholder="Search by coach name, years of experience..."
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
        <>
            <div className="text-muted my-3">
                {paginationData && paginationData.total > 0 &&
                `Showing ${paginationData.from}-${paginationData.to} of ${paginationData.total} results`
                }
            </div>
            <small className="text-muted opacity-75">(Click name to view Full User Profile)</small>
        </>
      )}

      <DataTable 
        columns={columns} 
        data={applications} 
        loading={loading} 
        error={error}
        emptyMessage="No coach applications found."
      />

      <div className="mt-5 d-flex justify-content-center">
        <Pagination 
          paginationData={paginationData} 
          onPageChange={(url) => setCurrentPage(Number(new URL(url).searchParams.get('page')))} 
        />
      </div>

      {/* Certificate Modal */}
      <ShowModal 
        text="Coach Certification"
        show={showCertModal} 
        onHide={() => setShowCertModal(false)}
        path={certPath}
      />
    </>
  );
};

export default CoachApplicationsPage;