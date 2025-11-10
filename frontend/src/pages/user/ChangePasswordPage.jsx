import React, { useState } from 'react';
import { Form, Alert, Card, Spinner } from 'react-bootstrap';
import { FaLock } from 'react-icons/fa';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import { validate } from '../../utils/validation';
import apiClient from '../../api/apiClient';

const ChangePasswordPage = () => {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    const validationErrors = validate(formData, null, 'changePassword');
    setErrors(validationErrors);

    if (formData.new_password !== formData.new_password_confirmation) {
      return setError("Passwords do not match.");
    }

    if (Object.keys(validationErrors).length === 0) {
        try {
            setLoading(true);
            const response = await apiClient.post('/user/change-password', formData);
            setSuccess(response.data.message);
            // Clear form when success
            setFormData({ current_password: '', password: '', password_confirmation: '' });
        } catch (err) {
            if (err.response && err.response.status === 422) {
                const errors = err.response.data.errors;
                // Display the first error
                const firstErrorKey = Object.keys(errors)[0];
                setError(errors[firstErrorKey][0]);
            } else {
                setError(err.response?.data?.message || 'An error occurred.');
            }
        } finally {
            setLoading(false);
        }
    }
  };

  return (
    <div className="d-flex flex-column gap-2">
        <h3 className="fw-bold">Change Password</h3>
        <Card className="p-4 border-0 shadow-sm">
            <Card.Body>
                <Form onSubmit={handleSubmit}>
                    {success && <Alert variant="success">{success}</Alert>}
                    {error && <Alert variant="danger">{error}</Alert>}
                    
                    <FormField
                        label="Current Password"
                        type='password-toggle'
                        name="current_password"
                        value={formData.current_password}
                        onChange={handleChange}
                        placeholder="Current Password"
                        iconLeft={FaLock}
                        error={errors.current_password}
                        required
                    />
                    
                    <FormField
                        label="New Password"
                        type='password-toggle'
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="New Password"
                        iconLeft={FaLock}
                        error={errors.password}
                        required
                    />
                    
                    <FormField
                        label="Confirm New Password"
                        type='password-toggle'
                        name="password_confirmation"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        placeholder="Confirm New Password"
                        iconLeft={FaLock}
                        error={errors.password_confirmation}
                        required
                    />

                    <div className="mt-4">
                        <Button type="submit" className="mt-3" disabled={loading}>
                        {loading ? <div className="text-center"><Spinner animation="border" variant="success" /></div> : 'Update Password'}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    </div>
  );
};

export default ChangePasswordPage;