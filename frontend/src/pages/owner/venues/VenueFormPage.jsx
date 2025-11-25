import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { FaCamera, FaInfoCircle } from 'react-icons/fa';

import apiClient from '../../../api/apiClient';
import { useNotification } from '../../../contexts/NotificationContext';
import BackButton from '../../../components/common/BackButton';
import FormField from '../../../components/common/FormField';
import Button from '../../../components/common/Button';
import { validate } from '../../../utils/validation';
import MultipleImageUpload from '../../../components/common/MultipleImageUpload';

// Time options (00:00 to 23:30)
const generateTimeOptions = () => {
  const options = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      options.push({ value: time, label: time });
    }
  }
  return options;
};

const VenueFormPage = ({ mode }) => {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const isEditMode = mode === 'edit';

  const [formData, setFormData] = useState({
    name: '', state_id: '', address: '',
    opening_time: '00:00', closing_time: '00:00',
    weekday_price: '', weekend_price: '',
    phone_no: '', status: 'Active'
  });

  const [venueData, setVenueData] = useState(null);
  const [states, setStates] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [deletedPhotoIds, setDeletedPhotoIds] = useState([]);
  const [statusText, setStatusText] = useState('');
  
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [errors, setErrors] = useState('');

  const timeOptions = generateTimeOptions();

  // Fetch data
  useEffect(() => {
    const loadData = async () => {
      try {
        const statesRes = await apiClient.get('/states');
        setStates(statesRes.data);

        if (isEditMode) {
          const venueRes = await apiClient.get(`/owner/venues/${venueId}`);
          const v = venueRes.data.data;

          setVenueData(v);
          setFormData({
            name: v.name,
            state_id: v.state_id,
            address: v.address,
            opening_time: v.opening_time.substring(0, 5),
            closing_time: v.closing_time.substring(0, 5),
            weekday_price: v.weekday_price,
            weekend_price: v.weekend_price,
            phone_no: v.phone_no,
            status: v.status
          });
          setStatusText(v.apply_status);
          setExistingPhotos(v.photos);
        }
      } catch (err) {
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [isEditMode, venueId]);

  // Determine if read-only
  const isReadOnly = isEditMode && 
    (venueData?.apply_status === 'Pending' || 
     venueData?.apply_status === 'Rejected' || 
     venueData?.apply_status === 'Cancelled');

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    setError('');
    setPhotoError('');

    // Validation
    let hasError = false;
    const validationErrors = validate(formData, null, 'venueForm');
    setErrors(validationErrors);

    // Ensure there is at least 1 photo
    if (existingPhotos.length === 0 && newPhotos.length === 0) {
      setPhotoError("Please upload at least one venue photo.");
      hasError = true;
    }

    if (Object.keys(validationErrors).length === 0 && !hasError) {
        setSubmitting(true);
        const data = new FormData();

        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        newPhotos.forEach(file => data.append('photos[]', file));
        deletedPhotoIds.forEach(id => data.append('deleted_photos[]', id));

        try {
        if (isEditMode) {
            await apiClient.post(`/owner/venues/${venueId}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showNotification("Venue updated successfully.", "success");
        } else {
            console.log("called");
            await apiClient.post('/owner/venues', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showNotification("Venue application submitted successfully.", "success");
        }
        navigate('/owner/venues');
        } catch (err) {
        setError(err.response?.data?.message || "Failed to update venue/submit application.");
        } finally {
        setSubmitting(false);
        }
    }
  };

  const handleDeletePhoto = (photoId) => {
    setExistingPhotos(prev => prev.filter(p => p.id !== photoId));
    setDeletedPhotoIds(prev => [...prev, photoId]);
  };

  const handleCancelApplication = async () => {
    if (window.confirm("Are you sure you want to cancel this venue application?")) {
      try {
        await apiClient.delete(`/owner/venues/${venueId}/cancel`);
        showNotification("Venue application cancelled successfully.", "success");
        navigate('/owner/venues');
      } catch (err) {
        showNotification(err.response?.data?.message || "Failed to cancel venue application.", "error");
      }
    }
  };

  const handleDeleteVenue = async () => {
    if (window.confirm("Are you sure you want to delete this venue?")) {
      try {
        await apiClient.delete(`/owner/venues/${venueId}/delete`);
        showNotification("Venue deleted successfully.", "success");
        navigate('/owner/venues');
      } catch (err) {
        showNotification(err.response?.data?.message || "Failed to delete venue.", "error");
      }
    }
  };

  if (loading) return <div className="text-center p-5"><Spinner animation="border" variant="success" /></div>;

  return (
    <>
      <BackButton to="/owner/venues" place="Venues" />

      {isReadOnly && (
        <Alert variant="info" className="d-flex align-items-center">
          <FaInfoCircle className="me-2" />
          <div>
            This venue application status is <strong>{statusText}</strong>. Details cannot be edited.
          </div>
        </Alert>
      )}

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      
      

      <Form onSubmit={handleSubmit}>
        
        <Card className="border-0 shadow-sm p-4">
          <Card.Body>
            <h2 className="fw-bold mb-5">
                {isReadOnly ? 'View Venue Details' : isEditMode ? 'Edit Your Venue' : 'Apply For a New Venue'}
            </h2>

            <div className="d-flex flex-column gap-5">
                {/* Venue Details */}
                <div>     
                    <h4 className="fw-bold mb-3">Venue Details</h4>
                    <hr className="mt-3 mb-4" />

                    <FormField label="Venue Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} placeholder="Venue Name" disabled={isReadOnly} maxLength={255} required />

                    <FormField label="State" type="select" name="state_id" value={formData.state_id} onChange={handleChange} error={errors.state_id} options={states.map(s => ({ value: s.id, label: s.name }))} placeholder="-- Select a State --" disabled={isReadOnly} required />

                    <FormField as="textarea" label="Address" name="address" value={formData.address} onChange={handleChange} error={errors.address} rows={4} placeholder="Address" disabled={isReadOnly} maxLength={2000} required />
                </div>

                {/* Operations */}
                <div>
                    <h4 className="fw-bold mb-3">Operations</h4>
                    <hr className="mt-3 mb-4" />
                    <Row>
                        <Col md={6}>
                            <FormField label="Opening Time" type="select" name="opening_time" value={formData.opening_time} onChange={handleChange} error={errors.opening_time} options={timeOptions} disabled={isReadOnly} required />
                        </Col>
                        <Col md={6}>
                            <FormField label="Closing Time" type="select" name="closing_time" value={formData.closing_time} onChange={handleChange} error={errors.closing_time} options={timeOptions} disabled={isReadOnly} required />
                        </Col>
                        </Row>
                        <Row>
                        <Col md={6}>
                            <FormField label="Weekday Price (RM)" type="number" name="weekday_price" value={formData.weekday_price} onChange={handleChange} error={errors.weekday_price} placeholder="Weekday Price" disabled={isReadOnly} min="0.01" max="9999" step="0.01" required />
                        </Col>
                        <Col md={6}>
                            <FormField label="Weekend Price (RM)" type="number" name="weekend_price" value={formData.weekend_price} onChange={handleChange} error={errors.weekend_price} placeholder="Weekend Price" disabled={isReadOnly} min="0.01" max="9999" step="0.01" required />
                        </Col>
                    </Row>
                    <FormField label="Venue Phone Number" name="phone_no" value={formData.phone_no} onChange={handleChange} error={errors.phone_no} placeholder="E.g. 03-12345678" disabled={isReadOnly} required />
                    
                    {isEditMode && !isReadOnly && (
                    <FormField label="Status" type="select" name="status" value={formData.status} onChange={handleChange} options={[{value: 'Active', label: 'Active'}, {value: 'Inactive', label: 'Inactive'}]} required />
                    )}
                </div>

                {/* Venue Photos */}
                <div>
                    <h4 className="fw-bold mb-3">Venue Photos</h4>
                    <hr className="mt-3 mb-4" />

                    <MultipleImageUpload 
                        label="Photo" 
                        UploadIcon={FaCamera}
                        uploadMsg="Upload images"
                        reqMsg=".png, .jpg up to 10MB"
                        existingPhotos={existingPhotos}
                        onFilesChange={setNewPhotos}
                        onDeleteExisting={isReadOnly ? null : handleDeletePhoto}
                        maxFiles={5}
                        readOnly={isReadOnly}
                        required
                    />

                    {photoError && <Alert variant="danger">{photoError}</Alert>}
                </div>
            </div>

            {/* Actions */}
            <div>
                <Row className="mt-2 g-3">
                    {!isReadOnly && (
                    <Col md={isEditMode ? 6 : 12}>
                        <Button type="submit" className="w-100" disabled={submitting}>
                            {submitting ? <div className="text-center"><Spinner animation="border" variant="success" /></div> : (isEditMode ? 'Save Changes' : 'Submit Application')}
                        </Button>
                    </Col>
                    )}
                    {isEditMode && (
                        <Col md={venueData?.apply_status === 'Approved' ? 6 : 12}>
                            <Button 
                                variant="red" 
                                type="button" 
                                className="w-100" 
                                onClick={venueData?.apply_status === 'Pending' ? handleCancelApplication : handleDeleteVenue}>
                                {venueData?.apply_status === 'Pending' ? 'Cancel Venue Application' : 'Delete This Venue'}
                            </Button>
                        </Col>
                    )}
                </Row>
            </div>
          </Card.Body>
        </Card>
      </Form>
    </>
  );
};

export default VenueFormPage;