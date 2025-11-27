import React, { useState, useEffect, useCallback } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { FaSearch, FaTrash, FaEdit, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import apiClient from '../../../api/apiClient';
import { useNotification } from '../../../contexts/NotificationContext';
import Button from '../../../components/common/Button';
import DataTable from '../../../components/common/DataTable';
import Pagination from '../../../components/common/Pagination';

import '../../../components/common/SearchFilter.css';
import '../users/UserManagementPage.css';

const VoucherManagementPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [vouchers, setVouchers] = useState([]);
  const [paginationData, setPaginationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter state
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [activeFilters, setActiveFilters] = useState({ search: '', status: '' });
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch data
  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: currentPage });
      if (activeFilters.status) params.append('status', activeFilters.status);
      if (activeFilters.search) params.append('search', activeFilters.search);

      const res = await apiClient.get(`/admin/vouchers?${params.toString()}`);
      setVouchers(res.data.data);
      setPaginationData(res.data.meta);
    } catch (err) {
      setError("Failed to load vouchers.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeFilters]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this voucher?")) {
      try {
        await apiClient.delete(`/admin/vouchers/${id}`);
        showNotification("Voucher deleted successfully.", "success");
        fetchVouchers();
      } catch (err) {
        showNotification(err.response?.data?.message || "Failed to delete voucher.", "error");
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

  const columns = [
    { header: 'Voucher Code', accessor: 'code', cell: (row) => <span className="fw-bold">{row.code}</span> },
    { header: 'Description', accessor: 'description' },
    { header: 'Discount (RM)', accessor: 'discount_value' },
    { header: 'Point Cost', accessor: 'point_cost' },
    { header: 'Validity (Days)', accessor: 'validity' },
    { header: 'Status', cell: (row) => renderStatusBadge(row.status) },
    {
      header: 'Actions',
      width: '100px',
      cell: (row) => (
        <div className="d-flex gap-3">
          <span role="button" className="text-muted" title="Edit Voucher" onClick={() => navigate(`/admin/vouchers/${row.id}/edit`)}>
            <FaEdit size={18} />
          </span>
          <span role="button" className="text-danger" title="Delete Voucher" onClick={() => handleDelete(row.id)}>
            <FaTrash size={18} />
          </span>
        </div>
      )
    }
  ];

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Voucher Management</h2>
        <Button onClick={() => navigate('/admin/vouchers/create')} icon={<FaPlus />}>
          Add New Voucher
        </Button>
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
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </Form.Select>

                <Form.Control
                    type="text"
                    name="search"
                    placeholder="Search by voucher code, description..."
                    className="search-input"
                    value={filters.search}
                    onChange={handleFilterChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
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
        data={vouchers} 
        loading={loading} 
        error={error}
        emptyMessage="No vouchers found."
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

export default VoucherManagementPage;