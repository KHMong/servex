import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Spinner, Form, Alert } from 'react-bootstrap';
import { FaFileAlt } from 'react-icons/fa';

import apiClient from '../../../api/apiClient';
import { useNotification } from '../../../contexts/NotificationContext';
import BackButton from '../../../components/common/BackButton';
import Button from '../../../components/common/Button';
import { getImageUrl } from '../../../utils/imageUrl';
import ShowModal from '../../../components/common/ShowModal';

import './UserDetailsPage.css';

const DetailRow = ({ label, value }) => (
  <Col md={6} className="mb-4 d-flex flex-column gap-1">
    <div className="text-muted small text-uppercase fw-bold">{label}</div>
    <div className="fw-normal text-muted">{value || '-'}</div>
  </Col>
);

const UserDetailsPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusToUpdate, setStatusToUpdate] = useState('');
  const [showCertModal, setShowCertModal] = useState(false);
  const [certPath, setCertPath] = useState('');
  const [updating, setUpdating] = useState(false);

  // Fetch data
  const fetchUser = async () => {
    try {
      const res = await apiClient.get(`/admin/users/${userId}`);
      console.log(res.data.data);
      setUser(res.data.data);
      setCertPath(getImageUrl(res.data.data.coach_profile?.cert_path));
      setStatusToUpdate(res.data.data.status);
    } catch (err) {
      setError("Failed to load user details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUser(); }, [userId]);

  // Handlers
  const handleUpdateStatus = async () => {
    if (statusToUpdate === user.status) return;
    
    setUpdating(true);
    try {
      await apiClient.put(`/admin/users/${userId}/status`, { status: statusToUpdate });
      showNotification("User account status updated successfully.", "success");
      fetchUser();
    } catch (err) {
      showNotification(err.response?.data?.message || "Failed to update user account status.", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await apiClient.delete(`/admin/users/${userId}`);
        showNotification("User account deleted successfully.", "success");
        navigate('/admin/users');
      } catch (err) {
        showNotification(err.response?.data?.message || "Failed to delete user account.", "error");
      }
    }
  };

  // Helper for Status Badges
  const renderStatusBadge = (status, type) => {
    let badgeClass = 'badge-default';
    
    if (status === 'Pending') badgeClass = 'badge-pending';
    else if (status === 'Approved') badgeClass = 'badge-approved';
    else if (status === 'Rejected') badgeClass = 'badge-rejected';

    return <span className={`status-badge ${badgeClass}`}>{status}</span>;
  };

  if (loading) return <div className="text-center p-5"><Spinner animation="border" variant="success" /></div>;
  if (!user) return <p className="text-center text-muted p-5">No user found.</p>;

  return (
    <>
      <BackButton to="/admin/users" place="User Management" />

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="border-0 shadow-sm p-4 mb-4">
        <Card.Body>
          {/* Header Image */}
          <div className="text-center mb-5">
            <img 
              src={getImageUrl(user.photo_path)} 
              alt={user.name} 
              className="rounded-circle border shadow-sm"
              style={{ width: '220px', height: '220px', objectFit: 'cover' }}
            />
          </div>

          {/* User Info */}
          <h4 className="fw-bold text-dark">User Info</h4>
          <hr className="my-3" />
          <Row className="mb-5">
            <DetailRow label="Full Name" value={user.name} />
            <DetailRow label="User ID" value={user.user_id} />
            <DetailRow label="Email Address" value={user.email} />
            <DetailRow label="Phone Number" value={user.phone_no} />
            <DetailRow label="Date of Birth" value={user.date_of_birth} />
            <DetailRow label="Gender" value={user.gender} />
            <DetailRow label="Date Joined" value={user.date_joined} />
            <DetailRow label="Points Balance" value={user.points} />
          </Row>

          {/* Coach Profile Info */}
          {user.coach_profile && (
            <>
              <h4 className="fw-bold text-dark">Coach Profile Info</h4>
              <hr className="my-3" />
              <Row className="mb-5">
                <Col md={12} className="mb-4">
                  <div className="text-muted small text-uppercase fw-bold mb-2">Bio</div>
                  <div className="fw-normal text-muted">{user.coach_profile.bio}</div>
                </Col>
                <DetailRow label="Primary Coaching State" value={user.coach_profile.state} />
                <DetailRow label="Years of Experience" value={user.coach_profile.exp_year} />
                <Col md={6} className="mb-3">
                  <div className="text-muted small text-uppercase fw-bold mb-2">Certificate</div>
                  {certPath ? (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      icon={<FaFileAlt />}
                      onClick={() => setShowCertModal(true)}
                    >
                      View Certificate
                    </Button>
                  ) : <span className="text-muted">-</span>}
                </Col>
                <DetailRow label="Application Status" value={renderStatusBadge(user.coach_profile.status)} />
              </Row>
            </>
          )}

          {/* Owner Profile Info */}
          {user.owner_profile && (
            <>
              <h4 className="fw-bold text-dark">Owner Profile Info</h4>
              <hr className="my-3" />
              <Row className="mb-5">
                <DetailRow label="Company Name" value={user.owner_profile.company_name} />
                <DetailRow label="Business Registration No." value={user.owner_profile.business_reg_no} />
                <DetailRow label="Registration Status" value={renderStatusBadge(user.owner_profile.status)} />
              </Row>
            </>
          )}

          {/* Role & Status */}
          <h4 className="fw-bold text-dark">Roles & Status</h4>
          <hr className="my-3" />
          <Row className="mb-5">
            <Col md={6} className="mb-3">
              <div className="text-muted small text-uppercase fw-bold mb-2">Role</div>
              <div className="d-flex gap-2 align-items-center">
                <span className="fw-medium">{user.role}</span>
                {user.is_coach && <span className="status-badge badge-coach">Coach</span>}
                {user.is_organiser && <span className="status-badge badge-organiser">Organiser</span>}
              </div>
            </Col>
            
            <Col md={6} className="mb-3">
              <div className="text-muted small text-uppercase fw-bold mb-2">Account Status</div>
              <div className="d-flex gap-3">
                <Form.Select 
                  value={statusToUpdate} 
                  onChange={(e) => setStatusToUpdate(e.target.value)}
                  style={{ maxWidth: '200px' }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Form.Select>
                <Button 
                  onClick={handleUpdateStatus} 
                  disabled={updating || statusToUpdate === user.status}
                >
                  {updating ? <div className="text-center"><Spinner animation="border" variant="success" /></div> : 'Update Status'}
                </Button>
              </div>
            </Col>
          </Row>

          {/* Delete Button */}
          <div className="">
            <Button 
                variant="red"
                className="w-100"
                onClick={handleDelete}
            >
                Delete This User
            </Button>
          </div>

        </Card.Body>
      </Card>

      {/* Cert Modal */}
      {user.coach_profile && (
        <ShowModal 
          text="Coach Certification"
          show={showCertModal} 
          onHide={() => setShowCertModal(false)}
          path={certPath}
        />
      )}
    </>
  );
};

export default UserDetailsPage;