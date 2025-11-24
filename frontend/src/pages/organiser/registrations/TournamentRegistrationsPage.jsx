import React, { useState, useEffect, useCallback } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { FaSearch, FaCheck, FaTimes, FaDollarSign } from 'react-icons/fa';

import apiClient from '../../../api/apiClient';
import { useNotification } from '../../../contexts/NotificationContext';
import BackButton from '../../../components/common/BackButton';
import Button from '../../../components/common/Button';
import DataTable from '../../../components/common/DataTable';
import Pagination from '../../../components/common/Pagination';
import { getImageUrl } from '../../../utils/imageUrl';

import '../../../components/common/SearchFilter.css';
import './TournamentRegistrationsPage.css';

const TournamentRegistrationsPage = () => {
  const { tournamentId } = useParams();
  const { showNotification } = useNotification();

  // Header
  const [headerInfo, setHeaderInfo] = useState({ title: '', dates: '' });
  const [categoryOptions, setCategoryOptions] = useState([]);

  // Table data
  const [registrations, setRegistrations] = useState([]);
  const [paginationData, setPaginationData] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({ search: '', status: 'All', payment_status: 'All', category_id: 'All' });
  const [activeFilters, setActiveFilters] = useState({ ...filters });
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: currentPage });
      if (activeFilters.search) params.append('search', activeFilters.search);
      if (activeFilters.status !== 'All') params.append('status', activeFilters.status);
      if (activeFilters.payment_status !== 'All') params.append('payment_status', activeFilters.payment_status);
      if (activeFilters.category_id !== 'All') params.append('category_id', activeFilters.category_id);

      const res = await apiClient.get(`/organiser/tournaments/${tournamentId}/registrations?${params.toString()}`);
      
      setRegistrations(res.data.data);
      setPaginationData(res.data.meta);
      
      const info = res.data.tournament_info;
      setHeaderInfo({ title: info.title, dates: info.dates });
      setCategoryOptions(info.filter_categories);
    } catch (err) {
      setError("Failed to load registrations.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeFilters, tournamentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleFilterChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setActiveFilters(filters);
  };

  const handleAction = async (regId, action) => {
    let confirmMsg = "";
    let successMsg = "";
    let failureMsg = "";

    if (action === 'approve') {
        confirmMsg = "Are you sure you want to approve this registration?";
        successMsg = "Registration approved successfully.";
        failureMsg = "Failed to approve registrations.";
    }
    if (action === 'reject') {
        confirmMsg = "Are you sure you want to reject this registration?";
        successMsg = "Registration rejected successfully.";
        failureMsg = "Failed to reject registrations.";
    } 
    if (action === 'update-payment') {
        confirmMsg = "Update payment status?";
        successMsg = "Payment status updated successfully.";
        failureMsg = "Failed to update payment status.";
    }

    if (window.confirm(confirmMsg)) {
      try {
        await apiClient.put(`/organiser/registrations/${regId}/${action}`);
        showNotification(successMsg, "success");
        fetchData(); // Refresh table
      } catch (err) {
        showNotification(failureMsg, "error");
      }
    }
  };

  // Render two rows of participants
  const renderDoubleRow = (main, partner) => (
    <div className="d-flex flex-column gap-4">
      <div>{main}</div>
      {partner && <div className="text-muted">{partner}</div>}
    </div>
  );

  const columns = [
    {
      header: 'Participant',
      width: '20%',
      cell: (row) => (
        <div className="d-flex flex-column gap-3">
          {/* Main Participant */}
          <div className="d-flex align-items-center">
            <img src={getImageUrl(row.main_participant.photo_path)} alt="" className="rounded-circle me-3" width="40" height="40" style={{objectFit: 'cover', border: '2px solid var(--servex-light-gray-bg)'}} />
            <div>
                <div className="fw-bold">{row.main_participant.name}</div>
                <div className="small text-muted">{row.main_participant.user_id}</div>
            </div>
          </div>
          {/* Partner (if exists) */}
          {row.partner_participant && (
             <div className="d-flex align-items-center">
                <img src={getImageUrl(row.partner_participant.photo_path)} alt="" className="rounded-circle me-3" width="40" height="40" style={{objectFit: 'cover', border: '2px solid var(--servex-light-gray-bg)'}} />
                <div>
                    <div className="fw-bold">{row.partner_participant.name}</div>
                    <div className="small text-muted">{row.partner_participant.user_id}</div>
                </div>
             </div>
          )}
        </div>
      )
    },
    { 
      header: 'Gender', 
      cell: (row) => renderDoubleRow(
        row.main_participant.gender === 'M' ? 'Male' : 'Female', 
        row.partner_participant?.gender ? (row.partner_participant.gender === 'M' ? 'Male' : 'Female') : null
    )
    },
    { 
      header: 'Date of Birth', 
      cell: (row) => renderDoubleRow(row.main_participant.dob, row.partner_participant?.dob)
    },
    { 
      header: 'Phone No.', 
      cell: (row) => renderDoubleRow(row.main_participant.phone_no, row.partner_participant?.phone_no)
    },
    { 
      header: 'Category', 
      accessor: 'category' 
    },
    { 
      header: 'EC Phone No.', 
      accessor: 'ec_phone_no' 
    },
    {
      header: 'Payment Status',
      cell: (row) => {
        let badgeClass = 'badge-default';
        if (row.payment_status === 'Unpaid') badgeClass = 'badge-pending';
        if (row.payment_status === 'Paid') badgeClass = 'badge-approved';

        return <span className={`status-badge ${badgeClass}`}>{row.payment_status}</span>;
      }
    },
    {
      header: 'Status',
      cell: (row) => {
        let badgeClass = 'badge-default';
        if (row.status === 'Pending') badgeClass = 'badge-pending';
        if (row.status === 'Approved') badgeClass = 'badge-approved';
        if (row.status === 'Rejected') badgeClass = 'badge-rejected';
        if (row.status === 'Cancelled') badgeClass = 'badge-cancelled';

        return <span className={`status-badge ${badgeClass}`}>{row.status}</span>;
      }
    },
    {
      header: 'Actions',
      width: '120px',
      cell: (row) => {
        const isPending = row.status.includes('Pending');
        const isApproved = row.status === 'Approved';

        return (
          <div className="d-flex gap-2 justify-content-center">
            {isPending && (
              <>
                <Button variant="primary" size="sm" className="p-1 px-3" onClick={() => handleAction(row.id, 'approve')} title="Approve">
                  <FaCheck />
                </Button>
                <Button variant="red" size="sm" className="p-1 px-3" onClick={() => handleAction(row.id, 'reject')} title="Reject">
                  <FaTimes />
                </Button>
              </>
            )}

            {isApproved && (
              <>
                <Button variant="primary" size="sm" className="p-1 px-3" onClick={() => handleAction(row.id, 'update-payment')} title="Update Payment Status">
                  <FaDollarSign />
                </Button>
                <Button variant="red" size="sm" className="p-1 px-3" onClick={() => handleAction(row.id, 'reject')} title="Reject Registration">
                  <FaTimes />
                </Button>
              </>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <>
      <BackButton to="/organiser/tournaments" place="Tournaments" />
      
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-2">{headerInfo.title}</h2>
        <h5 className="text-muted fw-semibold">{headerInfo.dates}</h5>
      </div>

      {/* Filter Bar */}
      <Row className="mb-4">
        <Col md={12}>
          <div className="search-filter-wrapper flex-md-row align-items-stretch">
            <Form.Select 
              name="payment_status" 
              value={filters.payment_status} 
              onChange={handleFilterChange}
              className="search-select"
            >
              <option value="All">All Payment Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </Form.Select>

            <Form.Select 
              name="status" 
              value={filters.status} 
              onChange={handleFilterChange}
              className="search-select"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </Form.Select>

            <Form.Select 
              name="category_id" 
              value={filters.category_id} 
              onChange={handleFilterChange}
              className="search-select"
            >
              <option value="All">All Categories</option>
              {categoryOptions.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </Form.Select>

            <Form.Control
              type="text"
              name="search"
              placeholder="Search by name or player ID..."
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

      {/* Data Table */}
      <DataTable 
        columns={columns} 
        data={registrations} 
        loading={loading} 
        error={error}
        emptyMessage="No registrations found."
      />

      {/* Pagination */}
      <div className="mt-4 d-flex justify-content-center">
        <Pagination 
          paginationData={paginationData} 
          onPageChange={(url) => setCurrentPage(Number(new URL(url).searchParams.get('page')))} 
        />
      </div>
    </>
  );
};

export default TournamentRegistrationsPage;