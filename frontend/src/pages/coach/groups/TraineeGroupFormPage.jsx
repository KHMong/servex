import React, { useState, useEffect } from 'react';
import { Card, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { FaUsers } from 'react-icons/fa';

import apiClient from '../../../api/apiClient';
import { useNotification } from '../../../contexts/NotificationContext';
import BackButton from '../../../components/common/BackButton';
import FormField from '../../../components/common/FormField';
import Button from '../../../components/common/Button';

const TraineeGroupFormPage = ({ mode }) => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const isEditMode = mode === 'edit';

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch data if in Edit Mode
  useEffect(() => {
    if (isEditMode) {
      const fetchGroup = async () => {
        try {
          const res = await apiClient.get(`/coach/groups/${groupId}`);
          setFormData({
            name: res.data.data.name,
            description: res.data.data.description || ''
          });
        } catch (err) {
          setError("Failed to load group info.");
        } finally {
          setLoading(false);
        }
      };
      fetchGroup();
    }
  }, [isEditMode, groupId]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name) {
        return setError("Group Name is required.");
    }

    setSubmitting(true);

    try {
      if (isEditMode) {
        await apiClient.put(`/coach/groups/${groupId}`, formData);
        showNotification("Trainee group updated successfully.", "success");
      } else {
        await apiClient.post('/coach/groups', formData);
        showNotification("Trainee group created successfully.", "success");
      }
      navigate('/coach/groups');
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this trainee group?")) {
      try {
        await apiClient.delete(`/coach/groups/${groupId}`);
        showNotification("Trainee group deleted successfully.", "success");
        navigate('/coach/groups');
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete group.");
      }
    }
  };

  if (loading) return <div className="text-center p-5"><Spinner /></div>;

  return (
    <>
      <BackButton to="/coach/groups" place="Trainee Groups" />

      <Card className="border-0 shadow-sm p-4">
        <Card.Body>
          <h2 className="fw-bold mb-4">
            {isEditMode ? 'Edit Your Trainee Group' : 'Create a New Trainee Group'}
          </h2>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <FormField
              label="Group Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="E.g. Junior Squad, Adult Beginners"
              iconLeft={FaUsers}
              maxLength={255}
              required
            />

            <FormField
              as="textarea"
              rows={5}
              label="Group Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the focus of this group, the skill level of the trainees, or any other relevant details"
              maxLength={2000}
            />

            <Row className="mt-4 g-3">
              <Col md={isEditMode ? 6 : 12}>
                <Button type="submit" className="w-100" disabled={submitting}>
                  {submitting 
                    ? <div className="text-center"><Spinner animation="border" variant="success" /></div> 
                    : (isEditMode ? 'Save Changes' : 'Create Group')
                  }
                </Button>
              </Col>
              
              {isEditMode && (
                <Col md={6}>
                  <Button 
                    className="w-100"
                    variant="red"
                    onClick={handleDelete}
                  >
                    Delete This Group
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

export default TraineeGroupFormPage;