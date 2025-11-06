import React, { useState } from 'react';
import { Form, Row, Col, Alert } from 'react-bootstrap';
import { FaUser, FaLock, FaEnvelope, FaPhone, FaBuilding, FaRegAddressCard, FaCalendarAlt } from 'react-icons/fa';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import { validateRegistration } from '../../utils/validation';

import ImageUpload from '../../components/common/ImageUpload';

const RegistrationForm = ({ role, title, submitHandler }) => {
  const [formData, setFormData] = useState({
    name: '', gender: '', date_of_birth: '', email: '', phone_no: '',
    password: '', password_confirmation: '', photo: null,
    company_name: '', business_reg_no: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (file) => {
    setFormData(prev => ({ ...prev, photo: file }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const validationErrors = validateRegistration(formData, role);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      try {
        const dataToSend = { ...formData };

        // Change gender value
        if (dataToSend.gender) {
          dataToSend.gender = dataToSend.gender === 'Male' ? 'M' : 'F';
        }

        await submitHandler(dataToSend);
      } catch (err) {
        setApiError(err.response?.data?.message || 'Registration failed.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <div className="text-center mb-5">
        <h2 className="fw-bold">ServeX</h2>
        <h4 className="text-muted">{title}</h4>
      </div>
      <Form onSubmit={handleSubmit} noValidate>
        {apiError && <Alert variant="danger">{apiError}</Alert>}
        
        <FormField label="Full Name *" name="name" value={formData.name} onChange={handleChange} icon={FaUser} error={errors.name} />
        
        <Row>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>Gender *</Form.Label>
              <div>
                <Form.Check inline label="Male" name="gender" type="radio" value="Male" onChange={handleChange} isInvalid={!!errors.gender} />
                <Form.Check inline label="Female" name="gender" type="radio" value="Female" onChange={handleChange} isInvalid={!!errors.gender} />
              </div>
              {errors.gender && <Form.Text className="text-danger">{errors.gender}</Form.Text>}
            </Form.Group>
          </Col>
          <Col>
            <FormField label="Date of Birth *" type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} icon={FaCalendarAlt} error={errors.date_of_birth} />
          </Col>
        </Row>
        
        <Row>
          <Col md={6}><FormField label="Email Address *" type="email" name="email" value={formData.email} onChange={handleChange} icon={FaEnvelope} error={errors.email} /></Col>
          <Col md={6}><FormField label="Phone Number *" name="phone_no" value={formData.phone_no} onChange={handleChange} icon={FaPhone} error={errors.phone_no} placeholder={role === 'player' ? 'E.g. 0123456789' : 'E.g. 0312341234'} /></Col>
        </Row>

        <Row>
          <Col md={6}><FormField label="Password *" type="password" name="password" value={formData.password} onChange={handleChange} icon={FaLock} error={errors.password} /></Col>
          <Col md={6}><FormField label="Confirm Password *" type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} icon={FaLock} error={errors.password_confirmation} /></Col>
        </Row>
        
        <ImageUpload label="Profile Photo" onFileChange={handleFileChange} />
        
        {role === 'owner' && (
          <>
            <hr className="my-4" />
            <h5 className="mb-3">Business Information</h5>
            <Row>
              <Col md={6}><FormField label="Company Name *" name="company_name" value={formData.company_name} onChange={handleChange} icon={FaBuilding} error={errors.company_name} /></Col>
              <Col md={6}><FormField label="Business Registration Number *" name="business_reg_no" value={formData.business_reg_no} onChange={handleChange} icon={FaRegAddressCard} error={errors.business_reg_no} /></Col>
            </Row>
          </>
        )}
        
        <Button type="submit" className="w-100 mt-4" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </Form>
    </>
  );
};

export default RegistrationForm;