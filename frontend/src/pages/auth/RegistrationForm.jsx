import React, { useState } from 'react';
import { Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { FaUser, FaLock, FaEnvelope, FaPhone, FaBuilding, FaRegAddressCard, FaCamera } from 'react-icons/fa';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import { validate } from '../../utils/validation';
import { useNotification } from '../../contexts/NotificationContext';
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
  const { showNotification } = useNotification();

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
    const validationErrors = validate(formData, role, role === 'Player' ? 'registerPlayer' : 'registerOwner');
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

        const successMsg = role === 'Player' ? 
        "Account created successfully! You can now login to your account." : 
        "Account registered successfully! We'll contact you once your account has been approved.";

        showNotification(successMsg, 'success');
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Registration failed.';
        setApiError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <div className="text-center mb-5">
        <h2 className="fw-bold">ServeX</h2>
        <h4 className="text-muted fw-semibold">{title}</h4>
      </div>
      <Form onSubmit={handleSubmit} noValidate>
        {apiError && <Alert variant="danger">{apiError}</Alert>}
        <h5 className="mb-4 fw-semibold">Personal Information</h5>
        <FormField label="Full Name" name="name" value={formData.name} onChange={handleChange} iconLeft={FaUser} error={errors.name} placeholder="Full Name" required />
        
        <Row>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>Gender <span className="text-danger ms-1">*</span></Form.Label>
              <div>
                <Form.Check inline label="Male" name="gender" type="radio" id="gender-male" value="Male" onChange={handleChange} isInvalid={!!errors.gender} />
                <Form.Check inline label="Female" name="gender" type="radio" id="gender-female" value="Female" onChange={handleChange} isInvalid={!!errors.gender} />
              </div>
              {errors.gender && <Form.Text className="text-danger">{errors.gender}</Form.Text>}
            </Form.Group>
          </Col>
          <Col>
            <FormField label="Date of Birth" type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} error={errors.date_of_birth} required />
          </Col>
        </Row>
        
        <Row>
          <Col md={6}><FormField label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} iconLeft={FaEnvelope} error={errors.email} placeholder="you@example.com" required /></Col>
          <Col md={6}><FormField label="Phone Number" name="phone_no" maxLength={12} value={formData.phone_no} onChange={handleChange} iconLeft={FaPhone} error={errors.phone_no} placeholder={role === 'Player' ? 'E.g. 012-3456789' : 'E.g. 03-12345678'} required /></Col>
        </Row>

        <Row>
          <Col md={6}><FormField label="Password" type="password-toggle" name="password" minLength={8} maxLength={15} value={formData.password} onChange={handleChange} iconLeft={FaLock} error={errors.password} placeholder="Password" required /></Col>
          <Col md={6}><FormField label="Confirm Password" type="password-toggle" name="password_confirmation" minLength={8} maxLength={15} value={formData.password_confirmation} onChange={handleChange} iconLeft={FaLock} error={errors.password_confirmation} placeholder="Confirm Password" required /></Col>
        </Row>
        
        <ImageUpload label="Profile Photo" UploadIcon={FaCamera} onFileChange={handleFileChange} />
        
        {role === 'Owner' && (
          <>
            <hr className="my-4" />
            <h5 className="mb-4 fw-semibold">Business Information</h5>
            <Row>
              <Col md={6}><FormField label="Company Name" name="company_name" value={formData.company_name} onChange={handleChange} iconLeft={FaBuilding} error={errors.company_name} placeholder="Company Name" required /></Col>
              <Col md={6}><FormField label="Business Registration Number" name="business_reg_no" maxLength={12} value={formData.business_reg_no} onChange={handleChange} iconLeft={FaRegAddressCard} error={errors.business_reg_no} placeholder="E.g. 202501000001" required /></Col>
            </Row>
            <small className="text-muted fs-6"><strong>Note:</strong> Your registration will be reviewed before you can login to this account.</small>
          </>
        )}
        
        <Button type="submit" className="w-100 mt-4" disabled={loading}>
          {loading ? <div className="text-center"><Spinner animation="border" variant="success" /></div> : 
          role === 'Player' ? 'Create Account' : 'Register Account'}
        </Button>
      </Form>
    </>
  );
};

export default RegistrationForm;