import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { useNotification } from '../../contexts/NotificationContext';
import apiClient from '../../api/apiClient';
import Button from '../../components/common/Button';
import BackButton from '../../components/common/BackButton';
import FormField from '../../components/common/FormField';
import { validate } from '../../utils/validation';

const ActivityFormPage = ({ mode }) => {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const isEditMode = mode === 'edit';

  const [formData, setFormData] = useState({
    booking_id: '',
    skill_level_id: '',
    fee: '0.00',
    max_player: '2',
  });

  const [bookingChoices, setBookingChoices] = useState([]);
  const [skillLevels, setSkillLevels] = useState([]);
  const [bookingText, setBookingText] = useState(''); // For edit mode

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState('');

  useEffect(() => {
    setLoading(true);
    if (isEditMode) { // Edit
      apiClient.get(`/activities/${activityId}`)
        .then(res => {
          setFormData(res.data.activity);
          setSkillLevels(res.data.skill_levels);
          setBookingText(res.data.activity.booking_text);
        })
        .catch(() => setError("Failed to load activity data."))
        .finally(() => setLoading(false));
    } else { // Create
      apiClient.get('/activities/create-form')
        .then(res => {
          setBookingChoices(res.data.booking_choices);
          setSkillLevels(res.data.skill_levels);
        })
        .catch(() => setError("Failed to load form data."))
        .finally(() => setLoading(false));
    }
  }, [isEditMode, activityId]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationErrors = validate(formData, null, 'activityForm');
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
        setSubmitting(true);
        if (isEditMode) {
            try {
                await apiClient.put(`/activities/${activityId}`, formData);
                showNotification('Activity updated successfully.', 'success');
                navigate('/info/activity-history');
            } catch (err) {
                setError(err.response?.data?.message || 'Activity update failed.');
            } finally {
                setSubmitting(false);
            }
        } 
        else {
            try {
                await apiClient.post('/activities', formData);
                showNotification('Activity created successfully.', 'success');
                navigate('/info/activity-history');
            } catch (err) {
                setError(err.response?.data?.message || 'Activity creation failed.');
            } finally {
                setSubmitting(false);
            }
        }
    }
  };
  
  const handleCancelActivity = async () => {
    if (window.confirm("Are you sure you want to cancel this activity?")) {
      setError(null);
      showNotification('Cancelling the activity...', 'info');
      try {
        await apiClient.put(`/activities/${activityId}/cancel`);
        showNotification('Activity cancelled successfully.', 'success');
        navigate('/info/activity-history');
      } catch (err) {
        setError(err.response?.data?.message || 'Activity cancellation failed.');
      }
    }
  };

  if (loading) return <div className="text-center p-5"><Spinner /></div>;

  return (
    <Container className="py-5">
      <BackButton to={`/info/activity-history`} place="Activity History"></BackButton>
      <Card className="border shadow-sm">
        <Card.Body className="p-4 p-md-5">
            <h2 className="fw-bold">{isEditMode ? 'Edit Your Activity' : 'Create a New Activity'}</h2>
            <hr className="my-4" />
            <Form onSubmit={handleSubmit}>
                {error && <Alert variant="danger">{error}</Alert>}
                
                <FormField
                    label="Choose Your Booking"
                    type={isEditMode ? "text" : "select"}
                    name="booking_id"
                    value={isEditMode ? bookingText : formData.booking_id}
                    onChange={handleChange}
                    error={errors.booking_id}
                    options={bookingChoices.map(b => ({ value: b.id, label: b.booking_text }))}
                    placeholder="-- Select a Booking --"
                    disabled={isEditMode}
                    required
                />
                <Form.Text className="text-muted d-block mt-0 mb-4">
                    You can only create an activity for an upcoming, confirmed booking that does not already have an activity.
                </Form.Text>
                
                <FormField
                    label="Preferred Skill Level"
                    type="select"
                    name="skill_level_id"
                    value={formData.skill_level_id}
                    onChange={handleChange}
                    error={errors.skill_level_id}
                    options={skillLevels.map(sl => ({ value: sl.id, label: sl.name }))}
                    placeholder="-- Select a Skill Level --"
                    required
                />

                <Row>
                    <Col md={6}>
                        <FormField
                            label="Fee Per Person (RM)"
                            type="number"
                            name="fee"
                            value={formData.fee}
                            onChange={handleChange}
                            error={errors.fee}
                            step="0.50"
                            min="0"
                            max="9999"
                            placeholder="E.g. 5.00"
                            required
                        />
                        <Form.Text className="text-muted d-block mt-0 mb-4">
                            This is the amount each player will pay. Set to 0.00 for a free session.
                        </Form.Text>
                    </Col>
                    <Col md={6}>
                        <FormField
                            label="Max Players"
                            type="number"
                            name="max_player"
                            value={formData.max_player}
                            onChange={handleChange}
                            error={errors.max_player}
                            step="1"
                            min="2"
                            max="999"
                            placeholder="E.g. 4"
                            required
                        />
                    </Col>
                </Row>
                
                <Row className="g-3 mt-2">
                    <Col md={isEditMode ? 6 : 12} xs={12}>
                        <Button type="submit" className="w-100" disabled={submitting}>
                        {submitting ? <div className="text-center"><Spinner animation="border" variant="success" /></div> : (isEditMode ? 'Save Changes' : 'Create Activity')}
                        </Button>
                    </Col>
                    {isEditMode && (
                    <Col md={6} xs={12}>
                        <Button variant="red" className="w-100" onClick={handleCancelActivity}>
                            Cancel Activity
                        </Button>
                    </Col>
                    )}
                </Row>
            </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ActivityFormPage;