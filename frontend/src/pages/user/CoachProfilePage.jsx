import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Alert, Card, Spinner } from 'react-bootstrap';
import { FaFileAlt } from 'react-icons/fa';
import { TbCertificate } from "react-icons/tb";
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import ImageUpload from '../../components/common/ImageUpload';
import ShowModal from '../../components/common/ShowModal';
import { validate } from '../../utils/validation';
import { getImageUrl } from '../../utils/imageUrl';
import apiClient from '../../api/apiClient';

const CoachProfilePage = () => {
  const [formData, setFormData] = useState({
    bio: '',
    exp_year: '',
    state_id: '',
  });
  const [certFile, setCertFile] = useState(null);
  const [currentCertPath, setCurrentCertPath] = useState('');
  const [showCertModal, setShowCertModal] = useState(false);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [coachRes, statesRes] = await Promise.all([
          apiClient.get('/user/coach-profile'),
          apiClient.get('/states')
        ]);
        setFormData(coachRes.data.data);
        setCurrentCertPath(getImageUrl(coachRes.data.data.cert_path));
        setStates(statesRes.data);
      } catch (err) {
        setError("Failed to load coach profile data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleFileChange = (file) => setCertFile(file);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    const validationErrors = validate(formData, null, 'updateCoachProfile');
    setErrors(validationErrors);

    const data = new FormData();

    data.append('bio', formData.bio);
    data.append('exp_year', formData.exp_year);
    data.append('state_id', formData.state_id);

    if (certFile) {
      data.append('cert', certFile);
    }

    data.append('_method', 'PUT');

    if (Object.keys(validationErrors).length === 0) {
      setSaving(true);
      try {
        const response = await apiClient.post('/user/coach-profile', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccess('Coach profile updated successfully!');
        setCurrentCertPath(getImageUrl(response.data.data.cert_url));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to update profile.');
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) return <div className="text-center p-5"><Spinner /></div>;

  return (
    <>
      <div className="d-flex flex-column gap-2">
          <h3 className="fw-bold">Coach Profile</h3>
          <Card className="p-4 border-0 shadow-sm">
            <Card.Body>
                <Form onSubmit={handleSubmit}>
                {success && <Alert variant="success">{success}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}

                <FormField as="textarea" rows={5} label="Your Coaching Bio" name="bio" maxLength={2000} value={formData.bio} onChange={handleChange} error={errors.bio} placeholder="Tell us about your coaching philosophy, achievements, and what players can expect from your training sessions..." required />

                <Row>
                    <Col md={6}>
                        <FormField type="number" label="Years of Coaching Experience" name="exp_year" min="0" max="99" value={formData.exp_year} onChange={handleChange} error={errors.exp_year} placeholder="Years of Experience" required />
                    </Col>
                    <Col md={6}>
                        <FormField type="select" label="Primary Coaching State" name="state_id" value={formData.state_id} onChange={handleChange} options={states.map(s => ({ value: s.id, label: s.name }))} required />
                    </Col>
                </Row>

                <hr className="my-4" />
                
                <div className="d-flex flex-column gap-3">
                    <div>
                        <h5 className="mb-3">Certification</h5>
                        {currentCertPath ? (
                            <div className="mb-3">
                            <Button 
                                variant="secondary" 
                                icon={<FaFileAlt />} 
                                onClick={() => setShowCertModal(true)}
                            >
                                View Current Certificate
                            </Button>
                            </div>
                        ) : (
                          <p className="text-muted">No certification provided.</p>
                        )}
                    </div>
                    <div>
                        <ImageUpload label="Upload Certificate" accept="application/pdf, image/png, image/jpeg" UploadIcon={TbCertificate} uploadMsg="Upload a file" reqMsg=".pdf, .png, .jpg up to 2MB" onFileChange={handleFileChange} />
                    </div>
                </div>
                
                <div className="mt-4">
                    <Button type="submit" disabled={saving}>
                    {saving ? <div className="text-center"><Spinner animation="border" variant="success" /></div> : 'Save Changes'}
                    </Button>
                </div>
                </Form>
            </Card.Body>
          </Card>
      </div>
      {/* Cert Modal */}
      <ShowModal 
        text="Coach Certification"
        show={showCertModal} 
        onHide={() => setShowCertModal(false)}
        path={currentCertPath}
      />
    </>
  );
};

export default CoachProfilePage;