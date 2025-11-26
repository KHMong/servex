import React, { useState, useEffect, useCallback } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { FaSearch, FaTrash, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import apiClient from '../../../api/apiClient';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import Button from '../../../components/common/Button';
import DataTable from '../../../components/common/DataTable';
import Pagination from '../../../components/common/Pagination';

import '../../../components/common/SearchFilter.css';
import '../../../components/common/Badge.css';
import './UserManagementPage.css';

const UserManagementPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [users, setUsers] = useState([]);
  const [paginationData, setPaginationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter state
  const [filters, setFilters] = useState({ search: '', role: '', status: '', is_coach: '', is_organiser: '' });
  const [activeFilters, setActiveFilters] = useState({ search: '', role: '', status: '', is_coach: '', is_organiser: '' });
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch data
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: currentPage });
      Object.keys(activeFilters).forEach(key => {
        if (activeFilters[key]) params.append(key, activeFilters[key]);
      });

      const res = await apiClient.get(`/admin/users?${params.toString()}`);
      setUsers(res.data.data);
      setPaginationData(res.data.meta);
    } catch (err) {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeFilters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handlers
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFilters(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setActiveFilters(filters);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await apiClient.delete(`/admin/users/${id}`);
        showNotification("User account deleted successfully.", "success");
        fetchUsers();
      } catch (err) {
        showNotification(err.response?.data?.message || "Failed to delete user account.", "error");
      }
    }
  };

  // Helper for Status Badges
  const renderStatusBadge = (status, type) => {
    let badgeClass = 'badge-default';
    
    if (status === 'Active') badgeClass = 'badge-active';
    else if (status === 'Inactive') badgeClass = 'badge-inactive';

    return <span className={`status-badge ${badgeClass}`}>{status}</span>;
  };

  // Helper for Role Column
  const renderRoleColumn = (row) => (
    <div>
      <span>{row.role}</span>
      <div className="d-flex gap-2 mt-1">
        {row.is_coach && <span className="status-badge badge-coach">Coach</span>}
        {row.is_organiser && <span className="status-badge badge-organiser">Organiser</span>}
      </div>
    </div>
  );

  const columns = [
    { 
      header: 'User ID', 
      accessor: 'user_id', 
      width: '120px' 
    },
    { 
      header: 'Name', 
      accessor: 'name',
      cell: (row) => <span className="fw-bold">{row.name}</span> 
    },
    { 
      header: 'Phone No.', 
      accessor: 'phone_no' 
    },
    { 
      header: 'Email', 
      accessor: 'email' 
    },
    { 
      header: 'Role', 
      cell: renderRoleColumn 
    },
    { 
      header: 'Date Joined', 
      accessor: 'joined_date' 
    },
    { 
      header: 'Status', 
      cell: (row) => renderStatusBadge(row.status) 
    },
    {
      header: 'Actions',
      width: '100px',
      cell: (row) => {
        if (row.id !== user.id) {
            return (
                <div className="d-flex gap-3">
                    <span role="button" className="text-muted" title="Edit User Details" onClick={() => navigate(`/admin/users/${row.id}`)}>
                        <FaEdit size={18} />
                    </span>
                    <span role="button" className="text-danger" title="Delete User" onClick={() => handleDelete(row.id)}>
                        <FaTrash size={18} />
                    </span>
                </div>
            )
        }
      }
    }
  ];

  return (
    <>
      {/* Header Section */}
      <h2 className="fw-bold mb-4">User Management</h2>

      {/* Search Bar */}
      <Row className="mb-4">
        <Col md={12}>
            <div className="search-filter-wrapper flex-md-row">
                {/* Role Filter */}
                <Form.Select 
                    name="role"
                    value={filters.role}
                    onChange={handleFilterChange}
                    className="search-select" 
                    style={{ maxWidth: '150px' }}
                >
                    <option value="">All Roles</option>
                    <option value="Player">Player</option>
                    <option value="Owner">Owner</option>
                    <option value="Admin">Admin</option>
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

                {/* Checkboxes */}
                <div className="d-flex flex-column gap-1 px-2" style={{ width: '250px' }}>
                    <Form.Check 
                        type="checkbox"
                        name="is_coach" 
                        id="check-coach" 
                        label="Is Coach" 
                        checked={filters.is_coach}
                        onChange={handleFilterChange}
                        className="role-checkbox"
                    />
                    <Form.Check 
                        type="checkbox" 
                        name="is_organiser"
                        id="check-organiser" 
                        label="Is Organiser" 
                        checked={filters.is_organiser}
                        onChange={handleFilterChange}
                        className="role-checkbox"
                    />
                </div>

                {/* Search Input */}
                <Form.Control
                    type="text"
                    name="search"
                    placeholder="Search by user ID, name, phone number, email..."
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
        data={users} 
        loading={loading} 
        error={error}
        emptyMessage="No users found."
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

export default UserManagementPage;