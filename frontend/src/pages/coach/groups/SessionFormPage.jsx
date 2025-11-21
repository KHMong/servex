import React, { useState, useEffect } from 'react';
import { Card, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';

import apiClient from '../../../api/apiClient';
import { useNotification } from '../../../contexts/NotificationContext';
import BackButton from '../../../components/common/BackButton';
import FormField from '../../../components/common/FormField';
import Button from '../../../components/common/Button';
import { validate } from '../../../utils/validation';

const SessionFormPage = ({ mode }) => {
  const { groupId, sessionId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const isEditMode = mode === 'edit';

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_datetime: '',
    end_datetime: ''
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState('');
  
  const [isCompletedSession, setIsCompletedSession] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const fetchSession = async () => {
        try {
          const res = await apiClient.get(`/coach/sessions/${sessionId}`);
          const data = res.data.data;
          
          // Convert date format to input datetime-local format (YYYY-MM-DDTHH:mm)
          const formatForInput = (dateStr) => new Date(dateStr).toISOString().slice(0, 16);

          setFormData({
            name: data.name,
            description: data.description || '',
            start_datetime: formatForInput(data.start_datetime_raw),
            end_datetime: formatForInput(data.end_datetime_raw)
          });

          // Check if session is completed
          if (data.status === 'Completed') {
            setIsCompletedSession(true);
          }

        } catch (err) {
          setError("Failed to load session details.");
        } finally {
          setLoading(false);
        }
      };
      fetchSession();
    }
  }, [isEditMode, sessionId]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationErrors = validate(formData, null, 'sessionForm');
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
        try {
        setSubmitting(true);
        if (isEditMode) {
            await apiClient.put(`/coach/sessions/${sessionId}`, formData);
            showNotification("Session updated successfully.", "success");
        } else {
            await apiClient.post(`/coach/groups/${groupId}/sessions`, formData);
            showNotification("Session scheduled successfully.", "success");
        }
        navigate(`/coach/groups/${groupId}`);
        } catch (err) {
        setError(err.response?.data?.message || "Failed to update/schedule session.");
        } finally {
        setSubmitting(false);
        }
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to cancel this session?")) {
      try {
        await apiClient.delete(`/coach/sessions/${sessionId}`);
        showNotification("Session cancelled successfully.", "success");
        navigate(`/coach/groups/${groupId}`);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to cancel session.");
      }
    }
  };

  if (loading) return <div className="text-center p-5"><Spinner animation="border" variant="success" /></div>;

  return (
    <>
      <BackButton to={`/coach/groups/${groupId}`} place="Trainee Group Details" />

      <Card className="border-0 shadow-sm p-4">
        <Card.Body>
          <h2 className="fw-bold mb-4">
            {isEditMode ? 'Edit Your Training Session' : 'Schedule a New Training Session'}
          </h2>

          {error && <Alert variant="danger">{error}</Alert>}
          {isCompletedSession && <Alert variant="info">This session has already completed. Date and time cannot be changed.</Alert>}

          <Form onSubmit={handleSubmit}>
            <FormField
              label="Session Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="E.g. Footwork Drills, Advanced Smash Techniques"
              required
              maxLength={255}
            />

            <FormField
              as="textarea"
              rows={5}
              label="Session Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detail about what is the content for the training session (Including venue address is recommended)"
              maxLength={2000}
            />

            <Row>
              <Col md={6}>
                <FormField
                  label="Start Date and Time"
                  type="datetime-local"
                  name="start_datetime"
                  value={formData.start_datetime}
                  onChange={handleChange}
                  error={errors.start_datetime}
                  disabled={isCompletedSession}
                  required
                />
              </Col>
              <Col md={6}>
                <FormField
                  label="End Date and Time"
                  type="datetime-local"
                  name="end_datetime"
                  value={formData.end_datetime}
                  onChange={handleChange}
                  error={errors.end_datetime}
                  disabled={isCompletedSession}
                  required
                />
              </Col>
            </Row>

            <Row className="mt-2 g-3">
              <Col md={isEditMode && !isCompletedSession ? 6 : 12}>
                <Button type="submit" className="w-100" disabled={submitting}>
                  {submitting 
                    ? <div className="text-center"><Spinner animation="border" variant="success" /></div> 
                    : (isEditMode ? 'Save Changes' : 'Schedule Session')
                  }
                </Button>
              </Col>
              
              {isEditMode && !isCompletedSession && (
                <Col md={6}>
                  <Button 
                    variant="red"
                    className="w-100"
                    onClick={handleDelete}
                  >
                    Cancel This Session
                  </Button>
                </Col>
              )}
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
};

export default SessionFormPage;