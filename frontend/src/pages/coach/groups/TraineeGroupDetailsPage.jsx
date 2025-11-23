import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Spinner, Form, Tabs, Tab, Alert } from 'react-bootstrap';
import { FaSearch, FaTrash, FaCalendarAlt, FaClock, FaUserPlus } from 'react-icons/fa';

import apiClient from '../../../api/apiClient';
import { useNotification } from '../../../contexts/NotificationContext';
import BackButton from '../../../components/common/BackButton';
import Button from '../../../components/common/Button';
import DataTable from '../../../components/common/DataTable';
import Pagination from '../../../components/common/Pagination';
import AddTraineeModal from './AddTraineeModal';
import { getImageUrl } from '../../../utils/imageUrl';
import '../../../components/common/SearchFilter.css';
import '../../../components/common/StatusTab.css';

const TraineeGroupDetailsPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Group Info State
  const [group, setGroup] = useState(null);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [groupError, setGroupError] = useState('');

  // Trainees State
  const [trainees, setTrainees] = useState([]);
  const [traineePagination, setTraineePagination] = useState(null);
  const [traineeFilters, setTraineeFilters] = useState({ search: '', gender: '' });
  const [activeTraineeFilters, setActiveTraineeFilters] = useState({ search: '', gender: '' });
  const [traineePage, setTraineePage] = useState(1);
  const [loadingTrainees, setLoadingTrainees] = useState(false);
  const [traineeError, setTraineeError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Sessions State
  const [sessions, setSessions] = useState([]);
  const [sessionPagination, setSessionPagination] = useState(null);
  const [sessionTab, setSessionTab] = useState('Scheduled');
  const [sessionPage, setSessionPage] = useState(1);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessionError, setSessionError] = useState('');

  // Fetch Group Info
  useEffect(() => {
    apiClient.get(`/coach/groups/${groupId}`)
      .then(res => setGroup(res.data.data))
      .catch(() => setGroupError("Failed to load group info."))
      .finally(() => setLoadingGroup(false));
  }, [groupId]);

  // Fetch Trainees
  const fetchTrainees = useCallback(async () => {
    setLoadingTrainees(true);
    try {
      const params = new URLSearchParams({
        page: traineePage,
        ...activeTraineeFilters
      });
      const res = await apiClient.get(`/coach/groups/${groupId}/trainees?${params.toString()}`);
      setTrainees(res.data.data);
      setTraineePagination(res.data.meta);
    } catch (error) {
      setTraineeError("Failed to load trainees.");
    } finally {
      setLoadingTrainees(false);
    }
  }, [groupId, traineePage, activeTraineeFilters]);

  useEffect(() => { fetchTrainees(); }, [fetchTrainees]);

  // Fetch Sessions
  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const res = await apiClient.get(`/coach/groups/${groupId}/sessions?status=${sessionTab}&page=${sessionPage}`);
      setSessions(res.data.data);
      setSessionPagination(res.data.meta);
    } catch (error) {
      setSessionError("Failed to load training sessions.");
    } finally {
      setLoadingSessions(false);
    }
  }, [groupId, sessionTab, sessionPage]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  // Handlers
  const handleTraineeSearch = () => {
    setActiveTraineeFilters(traineeFilters);
    setTraineePage(1);
  };

  const handleRemoveTrainee = async (id) => {
    if (window.confirm("Are you sure you want to remove this trainee from the group?")) {
      try {
        await apiClient.delete(`/coach/group-members/${id}`);
        showNotification("Trainee removed successfully.", "success");
        fetchTrainees();
      } catch (err) {
        showNotification("Failed to remove trainee.", "error");
      }
    }
  };

  // Handle cancel
  const handleCancel = async (id) => {
    if (window.confirm("Are you sure you want to cancel this session?")) {
      try {
        await apiClient.delete(`/coach/sessions/${id}`);
        showNotification("Session cancelled successfully.", "success");
        fetchSessions(); // Refresh
      } catch (error) {
        setSessionError(error.response?.data?.message || "Failed to cancel session.");
      }
    }
  };

  const traineeColumns = [
    {
      header: 'Trainee',
      cell: (row) => (
        <div className="d-flex align-items-center">
          <img src={getImageUrl(row.photo_path)} alt={row.name} className="rounded-circle me-3" width="40" height="40" style={{objectFit: 'cover', border: '2px solid var(--servex-light-gray-bg)'}} />
          <span className="fw-bold">{row.name}</span>
        </div>
      )
    },
    { 
      header: 'Gender', 
      cell: (row) => row.gender === 'M' ? 'Male' : 'Female',
      width: '15%' 
    },
    { header: 'Email', accessor: 'email', width: '25%' },
    { header: 'Phone No.', accessor: 'phone_no', width: '20%' },
    {
      header: 'Actions',
      cell: (row) => (
        <span 
          role="button" 
          className="text-danger"
          onClick={() => handleRemoveTrainee(row.id)}
          title="Remove Trainee"
        >
          <FaTrash />
        </span>
      ),
      width: '10%'
    }
  ];

  if (loadingGroup) return <div className="text-center p-5"><Spinner animation="border" variant="success" /></div>;
  if (!group) return <p className="text-center p-5">Group not found.</p>;

  return (
    <>
      <BackButton to="/coach/groups" place="Trainee Groups" />

      {/* Header Section */}
      {groupError && <Alert variant="danger">{groupError}</Alert>}
      <div className="mb-5">
        <h1 className="fw-bold mb-2">{group.name}</h1>
        <p className="text-muted fs-5">{group.description || 'No description.'}</p>
      </div>

      {/* Trainees Section */}
      <section className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="fw-bold">Trainees</h3>
          <Button onClick={() => setShowAddModal(true)} icon={<FaUserPlus />}>
            Add New Trainee
          </Button>
        </div>

        {traineeError && <Alert variant="danger">{traineeError}</Alert>}

        {/* Filter */}
        <div className="search-filter-wrapper flex-md-row mb-4">
          <Form.Select 
            className="search-select"
            value={traineeFilters.gender}
            onChange={(e) => setTraineeFilters(prev => ({ ...prev, gender: e.target.value }))}
            style={{ flex: '0 0 150px' }}
          >
            <option value="">All Genders</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </Form.Select>
          <Form.Control
            placeholder="Search by trainee name, email, or phone..."
            className="search-input"
            value={traineeFilters.search}
            onChange={(e) => setTraineeFilters(prev => ({ ...prev, search: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && handleTraineeSearch()}
          />
          <Button onClick={handleTraineeSearch} icon={<FaSearch />}>Search</Button>
        </div>

        <div className="text-muted my-3">
            {traineePagination && traineePagination.total > 0 &&
            `Showing ${traineePagination.from}-${traineePagination.to} of ${traineePagination.total} results`
            }
        </div>

        <DataTable 
          columns={traineeColumns} 
          data={trainees} 
          loading={loadingTrainees}
          emptyMessage="No trainees found."
        />

        {/* Pagination */}
        <div className="mt-5 d-flex justify-content-center">
            <Pagination 
            paginationData={traineePagination} 
            onPageChange={(url) => setTraineePage(Number(new URL(url).searchParams.get('page')))} 
            />
        </div>
      </section>

      {/* Training Sessions Section */}
      <section>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="fw-bold">Training Sessions</h3>
          <Button to={`/coach/groups/${groupId}/sessions/create`} icon={<FaCalendarAlt />}>
            Schedule New Session
          </Button>
        </div>

        <Tabs 
          activeKey={sessionTab} 
          onSelect={(k) => { setSessionTab(k); setSessionPage(1); }} 
          className="mb-4"
        >
          <Tab eventKey="Scheduled" title="Scheduled" />
          <Tab eventKey="Completed" title="Completed" />
        </Tabs>

        {sessionError && <Alert variant="danger">{sessionError}</Alert>}

        {loadingSessions ? (
          <div className="text-center p-5"><Spinner animation="border" variant="success" /></div>
        ) : (
          <>
            <div className="text-muted my-3">
                {sessionPagination && sessionPagination.total > 0 &&
                `Showing ${sessionPagination.from}-${sessionPagination.to} of ${sessionPagination.total} results`
                }
            </div>
            {sessions.length > 0 ? (
              <Row xs={1} className="g-3">
                {sessions.map(session => (
                  <Col key={session.id}>
                    <Card className="border-0 shadow-sm">
                      <Card.Body className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                          <h5 className="fw-bold mb-1">{session.name}</h5>
                          <p className="text-muted mb-2 small">{session.description || 'No description'}</p>
                          <div className="text-muted small">
                            <FaCalendarAlt className="me-2" /> {session.date_formatted} 
                            <span className="mx-2">|</span> 
                            <FaClock className="me-2" /> {session.time_range}
                          </div>
                        </div>
                        
                        <div className="d-flex gap-2 mt-3 mt-md-0">
                          <Button variant="tertiary" className="btn-sm" onClick={() => navigate(`/coach/groups/${groupId}/sessions/${session.id}/attendance`)}>Manage Attendance</Button>
                          <Button variant="secondary" className="btn-sm" onClick={() => navigate(`/coach/groups/${groupId}/sessions/${session.id}/edit`)}>Edit Session</Button>
                          {sessionTab === 'Scheduled' && (
                            <Button variant="red" className="btn-sm" onClick={() => handleCancel(session.id)}>Cancel</Button>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <p className="text-muted text-center p-5">
                No sessions found for this status.
              </p>
            )}

            {/* Pagination */}
            <div className="mt-5 d-flex justify-content-center">
                <Pagination 
                paginationData={sessionPagination} 
                onPageChange={(url) => setSessionPage(Number(new URL(url).searchParams.get('page')))} 
                />
            </div>
          </>
        )}
      </section>

      {/* Add Trainee Modal */}
      <AddTraineeModal 
        show={showAddModal} 
        onHide={() => setShowAddModal(false)} 
        groupId={groupId}
        onSuccess={() => {
          showNotification("Trainee added successfully!", "success");
          fetchTrainees();
        }}
      />
    </>
  );
};

export default TraineeGroupDetailsPage;