import React, { useState, useEffect, useCallback } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { FaSearch, FaPlus, FaUsers, FaEdit, FaTrash } from 'react-icons/fa';
import { useNotification } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import Button from '../../components/common/Button';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import '../../components/common/SearchFilter.css';

const TraineeGroupsPage = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);

  const [paginationData, setPaginationData] = useState(null);
  const [filters, setFilters] = useState({ search: ''});
  const [activeFilters, setActiveFilters] = useState({ search: ''});
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showNotification } = useNotification();

  // Fetch Data
  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        ...activeFilters
      });
      const res = await apiClient.get(`/coach/groups?${params.toString()}`);
      setGroups(res.data.data);
      setPaginationData(res.data.meta);
    } catch (error) {
      setError("Failed to load trainee groups.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeFilters]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

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

  // Handle Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this trainee group?")) {
      try {
        await apiClient.delete(`/coach/groups/${id}`);
        showNotification("Trainee group deleted successfully.", 'success');
        fetchGroups(); // Refresh
      } catch (error) {
        setError(error.response?.data?.message || "Failed to delete group.");
      }
    }
  };

  const columns = [
    { 
      header: 'Group Name', 
      accessor: 'name',
      cell: (row) => <span className="fw-bold">{row.name}</span>
    },
    { 
      header: 'Trainees', 
      accessor: 'active_trainees',
      width: '15%'
    },
    { 
      header: 'Sessions', 
      cell: (row) => (
        <span className="text-muted">
          <strong style={{color: 'var(--servex-green)'}}>{row.sessions.scheduled}</strong> Scheduled / {row.sessions.completed} Completed
        </span>
      ),
      width: '30%'
    },
    {
      header: 'Actions',
      width: '150px',
      cell: (row) => (
        <div className="d-flex gap-3">
          {/* Trainee Group Details */}
          <span 
            role="button" 
            className="text-secondary" 
            title="View Details"
            onClick={() => navigate(`/coach/groups/${row.id}`)}
          >
            <FaUsers size={18} />
          </span>

          {/* Edit Trainee Group */}
          <span 
            role="button" 
            className="text-secondary" 
            title="Edit Group"
            onClick={() => navigate(`/coach/groups/${row.id}/edit`)}
          >
            <FaEdit size={18} />
          </span>

          {/* Delete Group */}
          {row.can_delete ? (
            <span 
              role="button" 
              className="text-danger" 
              title="Delete Group"
              onClick={() => handleDelete(row.id)}
            >
              <FaTrash size={18} />
            </span>
          ) : (
            <span className="text-muted opacity-25" title="Cannot delete: Contain scheduled sessions">
              <FaTrash size={18} />
            </span>
          )}
        </div>
      )
    }
  ];

  return (
    <>
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">My Trainee Groups</h2>
        <Button to="/coach/groups/create" icon={<FaPlus />}>
          Create New Group
        </Button>
      </div>

      {/* Search Bar */}
      <Row className="mb-5">
        <Col md={12}>
          <div className="search-filter-wrapper flex-md-row">
            {/* Search Input */}
            <Form.Control
              type="text"
              name="search"
              placeholder="Search by group name..."
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

      {/* Table */}
      <DataTable 
        columns={columns} 
        data={groups} 
        loading={loading} 
        error={error}
        emptyMessage="No trainee groups found. Create one to get started!"
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

export default TraineeGroupsPage;