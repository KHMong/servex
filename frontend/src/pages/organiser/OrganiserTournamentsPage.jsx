import React, { useState, useEffect, useCallback } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { FaSearch, FaPlus, FaUsers, FaEdit, FaTrash, FaClipboardList } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import apiClient from '../../api/apiClient';
import { useNotification } from '../../contexts/NotificationContext';
import Button from '../../components/common/Button';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';

import '../../components/common/SearchFilter.css';
import './OrganiserTournamentsPage.css';

const OrganiserTournamentsPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [tournaments, setTournaments] = useState([]);
  const [paginationData, setPaginationData] = useState(null);
  
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [activeFilters, setActiveFilters] = useState({ search: '', status: '' });
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch Data
  const fetchTournaments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ 
        page: currentPage, 
        ...activeFilters 
      });
      const res = await apiClient.get(`/organiser/tournaments?${params.toString()}`);
      setTournaments(res.data.data);
      setPaginationData(res.data.meta);
    } catch (err) {
      setError("Failed to load tournaments.");
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

  // Handle Cancel
  const handleCancel = async (id) => {
    if (window.confirm("Are you sure you want to cancel this tournament?")) {
      try {
        await apiClient.delete(`/organiser/tournaments/${id}`);
        showNotification("Tournament cancelled successfully.", 'success');
        fetchTournaments(); // Refresh
      } catch (err) {
        setError(err.response?.data?.message || "Failed to cancel tournament.");
      }
    }
  };

  const columns = [
    { 
      header: 'Tournament Name', 
      accessor: 'name',
      cell: (row) => <span className="fw-bold">{row.name}</span>
    },
    { 
      header: 'Dates', 
      accessor: 'dates',
      width: '20%' 
    },
    { 
      header: 'Deadline', 
      accessor: 'deadline',
      width: '15%' 
    },
    { 
      header: 'Registrations', 
      accessor: 'registrations_summary',
      width: '20%',
      cell: (row) => 
        <span className="text-muted">
          <strong style={{color: 'var(--servex-green)'}}>{row.registrations_summary.approved}</strong> Approved / <strong style={{color: 'var(--servex-orange)'}}>{row.registrations_summary.pending}</strong> Pending
        </span>
    },
    {
      header: 'Status',
      width: '10%',
      cell: (row) => {
        let badgeClass = 'badge-default';
        if (row.status === 'Upcoming') badgeClass = 'badge-upcoming';
        if (row.status === 'Ongoing') badgeClass = 'badge-ongoing';
        if (row.status === 'Completed') badgeClass = 'badge-completed';
        if (row.status === 'Cancelled') badgeClass = 'badge-cancelled';

        return <span className={`status-badge ${badgeClass}`}>{row.status}</span>;
      }
    },
    {
      header: 'Actions',
      width: '150px',
      cell: (row) => {
        const isUpcoming = row.status === 'Upcoming';
        const isCompleted = row.status === 'Completed';
        const isCancelled = row.status === 'Cancelled';

        return (
          <div className="d-flex gap-3 action-icons">
            {/* Tournament Registrations (Always visible) */}
            <span 
              role="button" className="text-muted" title="Registrations"
              onClick={() => navigate(`/organiser/tournaments/${row.id}/registrations`)}
            >
              <FaUsers size={18} />
            </span>

            {/* Edit (Always visible) */}
            <span 
            role="button" className="text-muted" title="Edit Tournament"
            onClick={() => navigate(`/organiser/tournaments/${row.id}/edit`)}
            >
              <FaEdit size={18} />
            </span>

            {/* Update Tournament Result (Only if Completed/Cancelled) */}
            {(isCompleted || isCancelled) ? (
              <span 
                role="button" className="text-muted" title="Update Result"
                onClick={() => navigate(`/organiser/tournaments/${row.id}/result`)}
              >
                <FaClipboardList size={18} />
              </span>
            ) : (
                <span className="text-muted opacity-25" title="Cannot update result: Tournament still upcoming/ongoing">
                    <FaClipboardList size={18} />
                </span>
            )}

            {/* 4. Cancel (Only if Upcoming) */}
            {isUpcoming ? (
              <span 
                role="button" className="text-danger" title="Cancel Tournament"
                onClick={() => handleCancel(row.id)}
              >
                <FaTrash size={18} />
              </span>
            ) : (
                <span className="text-muted opacity-25" title="Cannot cancel: Tournament already ongoing/completed/cancelled">
                    <FaTrash size={18} />
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
        <h2 className="fw-bold mb-0">Tournaments</h2>
        <Button to="/organiser/tournaments/create" icon={<FaPlus />}>
          Create New Tournament
        </Button>
      </div>

      {/* Search Bar */}
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
              <option value="Upcoming">Upcoming</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </Form.Select>

            {/* Search Input */}
            <Form.Control
              type="text"
              name="search"
              placeholder="Search by tournament name..."
              className="search-input"
              value={filters.search}
              onChange={handleFilterChange}
            />

            {/* Search Button */}
            <Button 
              type="submit" 
              icon={<FaSearch />} 
              className="search-action-button"
              onClick={handleSearch}
            >
              Search
            </Button>
          </div>
        </Col>
      </Row>

      <div className="text-muted my-3">
        {paginationData && paginationData.total > 0 &&
          `Showing ${paginationData.from}-${paginationData.to} of ${paginationData.total} results`
        }
      </div>

      {/* Table */}
      <DataTable 
        columns={columns} 
        data={tournaments} 
        loading={loading} 
        error={error}
        emptyMessage="No tournaments found."
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

export default OrganiserTournamentsPage;