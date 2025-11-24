import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Spinner, Alert } from 'react-bootstrap';
import { FaUsers, FaUser, FaPhoneAlt } from 'react-icons/fa';
import { useNotification } from '../../contexts/NotificationContext';
import apiClient from '../../api/apiClient';
import Button from '../../components/common/Button';
import BackButton from '../../components/common/BackButton';
import { validate } from '../../utils/validation';
import FormField from '../../components/common/FormField';

const RegisterTournamentPage = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [tournamentName, setTournamentName] = useState('');
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ category_id: '', partner_id: '', ec_phone_no: '' });
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState('');

  useEffect(() => {
    setLoading(true);
    apiClient.get(`/tournaments/${tournamentId}/registration-form`)
      .then(res => {
        setTournamentName(res.data.tournament_name);
        setCategories(res.data.categories);
      })
      .catch(err => setError("Failed to load registration data."))
      .finally(() => setLoading(false));
  }, [tournamentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Update selected category
    if (name === 'category_id') {
      const selectedCat = categories.find(cat => cat.id.toString() === value);
      setSelectedCategoryName(selectedCat ? selectedCat.name : '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationErrors = validate(formData, null, 'registerTournament');
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setSubmitting(true);
      try {
        await apiClient.post(`/tournaments/${tournamentId}/register`, formData);
        showNotification('Registration submitted successfully.', 'success');
        // Redirect to Tournament History Page
        navigate(`/info/tournament-history`);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Registration failed.';
        setError(errorMessage);
      } finally {
        setSubmitting(false);
      }
    }
  };
  
  const showPartnerField = selectedCategoryName && selectedCategoryName.toLowerCase().includes('doubles');

  if (loading) return <div className="text-center p-5"><Spinner /></div>;

  return (
    <Container className="py-5 ">
        <div>
            <BackButton to={`/tournaments/${tournamentId}`} place="Tournament Details"></BackButton>
            <Card className="border shadow-sm">
                <Card.Body className="p-4 p-md-5">
                <div className="d-flex flex-column">
                    <h2 className="fw-bold">Tournament Registration</h2>
                    <p className="text-muted mb-0">You are registering for <strong>{tournamentName || '...'}</strong>.</p>
                </div>
                <hr className="my-4" />

                <Form onSubmit={handleSubmit}>
                    {error && <Alert variant="danger">{error}</Alert>}
                    
                    <FormField
                    label="Select Category"
                    type="select"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    error={errors.category_id}
                    iconLeft={FaUsers}
                    options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                    placeholder="-- Choose a category --"
                    required
                    />
                    
                    {showPartnerField && (
                    <FormField
                        label="Partner's Player Id"
                        name="partner_id"
                        value={formData.partner_id}
                        onChange={handleChange}
                        error={errors.partner_id}
                        placeholder="E.g. P2501010001"
                        iconLeft={FaUser}
                        required
                    />
                    )}
                    
                    <FormField
                    label="Emergency Contact"
                    name="ec_phone_no"
                    value={formData.ec_phone_no}
                    onChange={handleChange}
                    error={errors.ec_phone_no}
                    placeholder="E.g. 012-3456789"
                    iconLeft={FaPhoneAlt}
                    required
                    />

                    <Button type="submit" className="w-100 mt-3" disabled={submitting}>
                    {submitting ? <div className="text-center"><Spinner animation="border" variant="success" /></div> : 'Submit Registration'}
                    </Button>
                </Form>
                </Card.Body>
            </Card>
        </div>
    </Container>
  );
};

export default RegisterTournamentPage;