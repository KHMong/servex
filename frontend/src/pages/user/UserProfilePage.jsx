import React, { useState, useRef, useEffect } from 'react';
import { Form, Row, Col, Alert, Card, Spinner } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaPhone, FaPen, FaBuilding, FaRegAddressCard } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import { validate } from '../../utils/validation';
import { getImageUrl } from '../../utils/imageUrl';
import apiClient from '../../api/apiClient';
import './UserProfilePage.css';

const UserProfilePage = () => {
  const { user, setUser } = useAuth();
  const [newImageFile, setNewImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user.name || '',
    gender: user.gender || '',
    date_of_birth: user.dob_for_input || '',
    email: user.email || '',
    phone_no: user.phone_no || '',
    company_name: user?.owner_profile?.company_name || '',
    business_reg_no: user?.owner_profile?.business_reg_no || '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccess('');

    const validationErrors = validate(formData, user.role, 'updateUserProfile');
    setErrors(validationErrors);

    // Turn to JSON so that it support file uploads
    const data = new FormData();

    data.append('name', formData.name);
    data.append('gender', formData.gender);
    data.append('date_of_birth', formData.date_of_birth);
    data.append('email', formData.email);
    data.append('phone_no', formData.phone_no);

    if (newImageFile) {
      data.append('photo', newImageFile);
    }

    data.append('_method', 'PUT');

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      try {
        const response = await apiClient.post('/user', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        setUser(response.data.data);
        setSuccess('Profile updated successfully.');
        setNewImageFile(null);
        setImagePreview(null);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Profile update failed.';
        setApiError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const imageUrl = imagePreview || getImageUrl(user.photo_path);

  return (
    <div className="d-flex flex-column gap-2">
      <h3 className="fw-bold">Profile Details</h3>
      <div className="d-flex flex-column gap-4">
        <Card className="p-4 border-0 shadow-sm">
          <Card.Body className="d-flex flex-column gap-5">
            <div>
              <h4 className="mb-3 fw-bold">User Details</h4>
              <hr/>
              {apiError && <Alert variant="danger">{apiError}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              <div className="text-center mb-4 d-flex align-items-center gap-4">
                <div className="profile-image-wrapper" onClick={() => fileInputRef.current.click()}>
                  <img src={imageUrl} alt="Profile" className="profile-image" />
                  <div className="edit-icon text-muted">
                    <FaPen />
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  accept="image/png, image/jpeg, image/jpg"
                />

                <div className="d-flex flex-column align-items-start">
                  <h4 className="mt-2 fw-semibold">{user.name}</h4>
                  <p className="fw-semibold">ID: <span className="text-muted">{user.user_id}</span></p>
                </div>
              </div>

              <Form onSubmit={handleSubmit}>
                
                <FormField label="Full Name" name="name" value={formData.name} onChange={handleChange} iconLeft={FaUser} error={errors.name} placeholder="Full Name" required />
                
                <Row>
                  <Col>
                    <Form.Group className="mb-3">
                      <Form.Label>Gender <span className="text-danger ms-1">*</span></Form.Label>
                      <div>
                        <Form.Check inline label="Male" name="gender" type="radio" id="gender-male" value="M" onChange={handleChange} checked={formData.gender === 'M'} isInvalid={!!errors.gender} />
                        <Form.Check inline label="Female" name="gender" type="radio" id="gender-female" value="F" onChange={handleChange} checked={formData.gender === 'F'} isInvalid={!!errors.gender} />
                      </div>
                      {errors.gender && <Form.Text className="text-danger">{errors.gender}</Form.Text>}
                    </Form.Group>
                  </Col>
                  <Col>
                    <FormField label="Date of Birth" type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} error={errors.date_of_birth} required />
                  </Col>
                </Row>

                <Row>
                  <Col md={6}><FormField label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} iconLeft={FaEnvelope} error={errors.email} placeholder="you@example.com" required disabled={user.role === 'Admin'} /></Col>

                  <Col md={6}><FormField label="Phone Number" name="phone_no" maxLength={12} value={formData.phone_no} onChange={handleChange} iconLeft={FaPhone} error={errors.phone_no} placeholder={user.role === 'Player' ? 'E.g. 012-3456789' : 'E.g. 03-12345678'} required /></Col>
                </Row>

                <Button type="submit" className="mt-3" disabled={loading}>{loading ? <div className="text-center"><Spinner animation="border" variant="success" /></div> : 'Save Changes'}</Button>
              </Form>         
            </div>
            {user.role === 'Owner' && (
              <div>
                <h4 className="mb-3 fw-bold">Business Information</h4>
                <hr/>
                <Row>
                  <Col md={6}>
                    <FormField
                      label="Company Name"
                      name="company_name"
                      value={formData.company_name}
                      iconLeft={FaBuilding}
                      disabled
                    />
                  </Col>
                  <Col md={6}>
                    <FormField
                      label="Business Registration Number"
                      name="business_reg_no"
                      value={formData.business_reg_no}
                      iconLeft={FaRegAddressCard}
                      disabled 
                    />
                  </Col>
                </Row>
              </div>
            )}
            
          </Card.Body>
        </Card>

        {(!user.is_coach && user.role === 'Player') && (
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-semibold">Become a Coach</h5>
                <p className="mb-0 text-muted">Share your expertise and start coaching players.</p>
              </div>
              {(user.coach_profile?.status === 'Pending') ? (
                <Button variant="tertiary" disabled>Pending Application</Button>
              ) : (
                <Button to="/coach/apply" variant="tertiary">
                  {user.coach_profile?.status === 'Rejected' ? 'Re-apply Now' : 'Apply Now'}
                </Button>
              )}
            </Card.Body>
          </Card>
        )}
        <Card className="border-0 shadow-sm">
          <Card.Body className="d-flex justify-content-between align-items-center">
            {(!user.is_organiser && user.role === 'Player') ? (
              <>
                <div>
                  <h5 className="fw-semibold">Become an Organiser</h5>
                  <p className="mb-0 text-muted">Host your own tournaments on ServeX.</p>
                </div>
                <Button to="/organiser/purchase-pass" variant="tertiary">Purchase Pass</Button>
              </>
            ) : (
              <div>
                <h5 className="fw-semibold">Organiser Pass Purchased</h5>
                <p className="mb-0 text-muted">Navigate to <span className="fw-semibold">Organiser Portal</span> for tournament management.</p>
              </div>
            )}
            
          </Card.Body>
        </Card>
      </div>
    </div>
    
  );
};

export default UserProfilePage;