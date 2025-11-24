import React, { useState, useEffect } from 'react';
import { Card, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { FaTrash, FaPlus, FaCamera, FaInfoCircle } from 'react-icons/fa';

import apiClient from '../../../api/apiClient';
import { useNotification } from '../../../contexts/NotificationContext';
import BackButton from '../../../components/common/BackButton';
import FormField from '../../../components/common/FormField';
import Button from '../../../components/common/Button';
import { validate } from '../../../utils/validation';
import ImageUpload from '../../../components/common/ImageUpload';
import { getImageUrl } from '../../../utils/imageUrl';

const TournamentFormPage = ({ mode }) => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const isEditMode = mode === 'edit';

  // State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [errors, setErrors] = useState('');

  // Read Only Mode
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [statusText, setStatusText] = useState('');

  // Select Field Data
  const [states, setStates] = useState([]);
  const [masterCategories, setMasterCategories] = useState([]);

  // Form Data
  const [formData, setFormData] = useState({
    name: '', venue_address: '', state_id: '',
    start_date: '', end_date: '', deadline: '',
    description: '', prize: '', rule: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [currentPhotoPath, setCurrentPhotoPath] = useState(null);

  // Category Rows
  const [categoryRows, setCategoryRows] = useState([]);

  // Fetch Data
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        // Get select field info
        const infoRes = await apiClient.get('/organiser/tournaments/create-info');
        setStates(infoRes.data.states);
        setMasterCategories(infoRes.data.tournament_categories);

        // Edit mode
        if (isEditMode) {
          const dataRes = await apiClient.get(`/organiser/tournaments/${tournamentId}`);
          const serverData = dataRes.data.form_data;

          const canEdit = dataRes.data.can_edit;
          setIsReadOnly(!canEdit);
          setStatusText(dataRes.data.status);
          
          setFormData({
            name: serverData.name,
            venue_address: serverData.venue_address,
            state_id: serverData.state_id,
            start_date: serverData.start_date.split('T')[0],
            end_date: serverData.end_date.split('T')[0],
            deadline: serverData.deadline.split('T')[0],
            description: serverData.description,
            prize: serverData.prize,
            rule: serverData.rule,
          });
          setCurrentPhotoPath(getImageUrl(serverData.photo_path));
          
          const mappedCategories = serverData.selected_categories.map(cat => ({
            _tempId: Math.random(), // Unique ID
            category_id: cat.id,
            entry_fee: cat.fee,
            can_remove: cat.can_remove
          }));
          setCategoryRows(mappedCategories);
        }
      } catch (err) {
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [isEditMode, tournamentId]);

  // Handlers
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleAddRow = () => {
    setCategoryRows([
        ...categoryRows, 
        { _tempId: Date.now(), category_id: '', entry_fee: '', can_remove: true }
    ]);
  };

  const handleRemoveRow = (indexToRemove) => {
    const row = categoryRows[indexToRemove];

    if (row.can_remove === false) {
        return showNotification("Cannot remove a category that has active registrations.", "error");
    }

    if(window.confirm("Are you sure you want to remove this category?")) {
        const updatedRows = categoryRows.filter((_, index) => index !== indexToRemove);
        setCategoryRows(updatedRows);
    }
  };

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...categoryRows];
    updatedRows[index][field] = value;
    setCategoryRows(updatedRows);
  };

  const handleCancelTournament = async () => {
    if(window.confirm("Are you sure you want to cancel this tournament?")) {
       try {
         await apiClient.delete(`/organiser/tournaments/${tournamentId}`);
         showNotification("Tournament cancelled successfully.", "success");
         navigate('/organiser/tournaments');
       } catch(err) {
         setError("Failed to cancel tournament.", "error");
       }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    setError('');
    setPhotoError('');
    setCategoryError('');

    // Validation
    let hasError = false;
    const validationErrors = validate(formData, null, 'tournamentForm');
    setErrors(validationErrors);
    
    if (!photoFile && !currentPhotoPath) {
        setPhotoError("Please upload a tournament photo.");
        hasError = true;
    }

    if (categoryRows.length === 0) {
        setCategoryError("Please add at least one tournament category.");
        hasError = true;
    }
    
    const seenCategories = new Set();
    for (const row of categoryRows) {
        // Empty input fields
        if (!row.category_id || !row.entry_fee) {
            return setCategoryError("Please fill in all tournament category fields.");
        }

        // Duplicated category
        const catIdString = String(row.category_id);
        if (seenCategories.has(catIdString)) {
            return setCategoryError("You cannot select the same category twice.");
        }

        seenCategories.add(catIdString);
    }
    
    if (Object.keys(validationErrors).length === 0 && !hasError) {
        setSubmitting(true);

        const submitData = new FormData();
        // Basic fields
        Object.keys(formData).forEach(key => submitData.append(key, formData[key]));
        // Photo
        if (photoFile) submitData.append('photo', photoFile);
        // Categories
        categoryRows.forEach((row, index) => {
            submitData.append(`categories[${index}][category_id]`, row.category_id);
            submitData.append(`categories[${index}][entry_fee]`, row.entry_fee);
        });

        try {
            if (isEditMode) {
                submitData.append('_method', 'PUT'); 
                await apiClient.post(`/organiser/tournaments/${tournamentId}`, submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                showNotification("Tournament updated successfully!", "success");
            } else {
                await apiClient.post('/organiser/tournaments', submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                showNotification("Tournament created successfully!", "success");
            }
            navigate('/organiser/tournaments');
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create/update tournament.");
        } finally {
            setSubmitting(false);
        }
    }
  };

  if (loading) return <div className="text-center p-5"><Spinner animation="border" variant="success" /></div>;

  return (
    <>
      <BackButton to="/organiser/tournaments" place="Tournaments" />

      {isReadOnly && (
        <Alert variant="info" className="d-flex align-items-center">
          <FaInfoCircle className="me-2" />
          <div>
            This tournament is <strong>{statusText}</strong>. Details cannot be edited.
          </div>
        </Alert>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <fieldset disabled={isReadOnly}></fieldset>
        
        <Card className="border-0 shadow-sm p-4">
          <Card.Body>
            <h2 className="fw-bold mb-5">
                {isEditMode ? (isReadOnly ? 'View Tournament Details' : 'Create a New Tournament') : 'Create a New Tournament'}
            </h2>

            <div className="d-flex flex-column gap-5">
                {/* Basic Information */}
                <div>
                    <h4 className="fw-bold mb-3">Basic Information</h4>
                    <hr className="mt-3 mb-4" />
                    <FormField label="Tournament Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} placeholder="Tournament Name" required maxLength={255} />
                    
                    <div className="mb-3">
                        {isEditMode && currentPhotoPath && !photoFile && (
                            <div className="d-flex flex-column align-items-center mb-2">
                                <img src={currentPhotoPath} alt="Current" style={{height: '450px', borderRadius: '8px'}} />
                                <div className="mt-2 text-muted small">Current Photo</div>
                            </div>
                        )}

                        {!isReadOnly && 
                            <>
                                <ImageUpload 
                                    label='Photo'
                                    accept="image/png, image/jpeg"
                                    UploadIcon={FaCamera}
                                    uploadMsg="Upload an image"
                                    reqMsg=".png, .jpg up to 10MB"
                                    onFileChange={setPhotoFile} 
                                    required={!isEditMode}
                                />
                                {photoError && <Alert variant="danger">{photoError}</Alert>}
                            </>
                        }
                    </div>

                    <Row>
                        <Col md={8}>
                            <FormField label="Venue Address" name="venue_address" value={formData.venue_address} onChange={handleChange} error={errors.venue_address} placeholder="Venue Address" required maxLength={2000} />
                        </Col>
                        <Col md={4}>
                            <FormField label="State" type="select" name="state_id" value={formData.state_id} onChange={handleChange} error={errors.state_id} options={states.map(s => ({value: s.id, label: s.name}))} placeholder="-- Select a State --" required />
                        </Col>
                    </Row>
                </div>

                {/* Dates & Deadlines */}
                <div>
                    <h4 className="fw-bold mb-3">Dates & Deadlines</h4>
                    <hr className="mt-3 mb-4" />
                    <Row>
                        <Col md={4}>
                            <FormField label="Registration Deadline" type="date" name="deadline" value={formData.deadline} onChange={handleChange} error={errors.deadline} required />
                        </Col>
                        <Col md={4}>
                            <FormField label="Start Date" type="date" name="start_date" value={formData.start_date} onChange={handleChange} error={errors.start_date} required />
                        </Col>
                        <Col md={4}>
                            <FormField label="End Date" type="date" name="end_date" value={formData.end_date} onChange={handleChange} error={errors.end_date} required />
                        </Col>
                    </Row>
                </div>

                {/* Tournament Categories */}
                <div>
                    <div className="d-flex justify-content-between align-items-center">
                        <h4 className="fw-bold">Tournament Categories</h4>
                        {!isReadOnly && (
                            <Button variant="tertiary" size="sm" onClick={handleAddRow} icon={<FaPlus />}>Add Category</Button>
                        )}
                    </div>

                    <hr className="mt-3 mb-4" />

                    {(!isReadOnly && categoryError) && (
                        <Alert variant="danger">{categoryError}</Alert>
                    )}

                    {/* Category Rows */}
                    {categoryRows.length > 0 ? (
                    <div className="d-flex flex-column">
                        {categoryRows.map((row, index) => (
                            <Row key={row._tempId} className="align-items-start">
                                <Col md={7}>
                                    <FormField 
                                        type="select" 
                                        value={row.category_id} 
                                        onChange={(e) => handleRowChange(index, 'category_id', e.target.value)}
                                        options={masterCategories.map(c => ({value: c.id, label: c.name}))}
                                        placeholder="-- Select category --"
                                        disabled={row.can_remove === false} 
                                    />
                                </Col>
                                <Col md={4}>
                                    <FormField 
                                        type="number" 
                                        value={row.entry_fee} 
                                        onChange={(e) => handleRowChange(index, 'entry_fee', e.target.value)}
                                        placeholder="Entry Fee (RM)"
                                    />
                                </Col>
                                <Col md={1}>
                                    {!isReadOnly && (
                                        <Button 
                                            variant="red"
                                            onClick={() => handleRemoveRow(index)}
                                        >
                                            <FaTrash size={18} />
                                        </Button>
                                    )}
                                </Col>
                            </Row>
                        ))}
                    </div>
                    ) : (
                        <div className="text-muted text-center py-3">
                            No categories added yet.
                        </div>
                    )}
                </div>

                {/* Tournament Details */}
                <div>
                    <h4 className="fw-bold mb-3">Tournament Details</h4>
                    <hr className="mt-3 mb-4" />

                    <FormField label="Description" as="textarea" rows={5} name="description" value={formData.description} maxLength={50000} onChange={handleChange} error={errors.description} placeholder="Detail about what is the content for the tournament" required />

                    <FormField label="Prize" as="textarea" rows={5} name="prize" value={formData.prize} maxLength={50000} onChange={handleChange} error={errors.prize} placeholder="Detail about the prize for winners, 1st runner up, 2nd runner up..." required />

                    <FormField label="Rules & Regulations" as="textarea" rows={5} name="rule" value={formData.rule} maxLength={50000} onChange={handleChange} error={errors.rule} placeholder="Detail about the rules and regulations for the tournament" required />
                </div>
            </div>

            {/* Actions */}
            <div>
                {!isReadOnly && (
                    <Row className="mt-2 g-3">
                        <Col md={isEditMode ? 6 : 12}>
                            <Button type="submit" className="w-100" disabled={submitting}>
                                {submitting ? <div className="text-center"><Spinner animation="border" variant="success" /></div> : (isEditMode ? 'Save Changes' : 'Create Tournament')}
                            </Button>
                        </Col>
                        {isEditMode && (
                            <Col md={6}>
                                <Button variant="red" type="button" className="w-100" onClick={handleCancelTournament}>
                                    Cancel This Tournament
                                </Button>
                            </Col>
                        )}
                    </Row>
                )}
            </div>
          </Card.Body>
        </Card>
      </Form>
    </>
  );
};

export default TournamentFormPage;