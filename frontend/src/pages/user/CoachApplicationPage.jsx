import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { TbCertificate } from "react-icons/tb";
import { useNotification } from '../../contexts/NotificationContext';
import apiClient from '../../api/apiClient';
import FormField from '../../components/common/FormField';
import ImageUpload from '../../components/common/ImageUpload';
import { validate } from '../../utils/validation';
import Button from '../../components/common/Button';
import BackButton from '../../components/common/BackButton';

const CoachApplicationPage = () => {
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({ state_id: '', exp_year: '', bio: '' });
  const [certFile, setCertFile] = useState(null);
  const [states, setStates] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setLoading(true);
    apiClient.get('/states')
      .then(res => setStates(res.data))
      .catch(() => setError("Failed to load data."))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleFileChange = (file) => setCertFile(file);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationErrors = validate(formData, null, 'coachApplication');
    setErrors(validationErrors);

    if (!certFile) {
      return setError("Please upload your certification file.");
    }
    
    const data = new FormData();
    data.append('state_id', formData.state_id);
    data.append('exp_year', formData.exp_year);
    data.append('bio', formData.bio);
    data.append('cert', certFile);

    if (Object.keys(validationErrors).length === 0) {
        setSubmitting(true);
        try {
        await apiClient.post('/coach/apply', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        showNotification('Application submitted successfully.', 'success');
        window.location.href = '/info/user-profile';
        } catch (err) {
        setError(err.response?.data?.message || 'Failed to submit application.');
        } finally {
        setSubmitting(false);
        }
    }
  };

  if (loading) return <div className="text-center p-5"><Spinner /></div>;

  return (
    <Container className="py-5">
      <BackButton to={`/info/user-profile`} place="My Profile"></BackButton>
      <Card className="border shadow-sm">
        <Card.Body className="p-4 p-md-5">
            <h2 className="fw-bold">Become a Coach</h2>
            <hr className="my-4" />
            <Form onSubmit={handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <FormField
                as="textarea"
                rows={5}
                label="Your Coaching Bio"
                name="bio"
                maxLength={2000}
                value={formData.bio}
                onChange={handleChange}
                error={errors.bio}
                placeholder="Tell us about your coaching philosophy, achievements, and what players can expect from your training sessions..."
                required
            />

            <Row>
                <Col md={6}>
                    <FormField
                        type="number"
                        label="Years of Coaching Experience"
                        name="exp_year"
                        min="0"
                        max="99"
                        value={formData.exp_year}
                        onChange={handleChange}
                        error={errors.exp_year}
                        placeholder="Years of Experience"
                        required
                    />
                </Col>
                <Col md={6}>
                    <FormField
                        type="select"
                        label="Primary Coaching State"
                        name="state_id"
                        value={formData.state_id}
                        onChange={handleChange}
                        error={errors.state_id}
                        options={states.map(s => ({ value: s.id, label: s.name }))}
                        placeholder="-- Select a state --"
                        required
                    />
                </Col>
            </Row>
            
            <ImageUpload 
                label='Upload Certificate'
                accept="application/pdf, image/png, image/jpeg"
                UploadIcon={TbCertificate}
                uploadMsg="Upload a file"
                reqMsg=".pdf, .png, .jpg up to 10MB"
                onFileChange={handleFileChange} 
                required
            />

            <Button type="submit" className="w-100 mt-3" disabled={submitting}>
            {submitting ? <div className="text-center"><Spinner animation="border" variant="success" /></div> : 'Submit Application'}
            </Button>
        </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CoachApplicationPage;