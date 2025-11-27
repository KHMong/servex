import React, { useState, useEffect } from 'react';
import { Card, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { FaTicketAlt, FaMoneyBillWave, FaCoins, FaCalendarAlt } from 'react-icons/fa';

import apiClient from '../../../api/apiClient';
import { useNotification } from '../../../contexts/NotificationContext';
import BackButton from '../../../components/common/BackButton';
import FormField from '../../../components/common/FormField';
import Button from '../../../components/common/Button';
import { validate } from '../../../utils/validation';

const VoucherFormPage = ({ mode }) => {
  const { voucherId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const isEditMode = mode === 'edit';

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_value: '',
    point_cost: '',
    validity: '',
    status: 'Active'
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState('');

  // Fetch data
  useEffect(() => {
    if (isEditMode) {
      const fetchVoucher = async () => {
        try {
          const res = await apiClient.get(`/admin/vouchers/${voucherId}`);
          // Ensure numbers are strings for inputs
          setFormData({
            ...res.data.data,
            discount_value: res.data.data.discount_value.replace(/,/g, ''),
            point_cost: String(res.data.data.point_cost),
            validity: String(res.data.data.validity)
          });
        } catch (err) {
          setError("Failed to load voucher details.");
        } finally {
          setLoading(false);
        }
      };
      fetchVoucher();
    }
  }, [isEditMode, voucherId]);

  // Handlers
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    const validationErrors = validate(formData, null, 'voucherForm');
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
        setSubmitting(true);

        try {
            if (isEditMode) {
                await apiClient.put(`/admin/vouchers/${voucherId}`, formData);
                showNotification("Voucher updated successfully.", "success");
            } else {
                await apiClient.post('/admin/vouchers', formData);
                showNotification("Voucher created successfully.", "success");
            }
            navigate('/admin/vouchers');
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create/update voucher.");
        } finally {
            setSubmitting(false);
        }
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this voucher?")) {
      try {
        await apiClient.delete(`/admin/vouchers/${voucherId}`);
        showNotification("Voucher deleted successfully.", "success");
        navigate('/admin/vouchers');
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete voucher.");
      }
    }
  };

  if (loading) return <div className="text-center p-5"><Spinner animation="border" variant="success" /></div>;

  return (
    <>
      <BackButton to="/admin/vouchers" place="Voucher Management" />

      <Card className="border-0 shadow-sm p-4">
        <Card.Body>
          <h2 className="fw-bold mb-4">
            {isEditMode ? 'Edit Your Voucher' : 'Create a New Voucher'}
          </h2>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <FormField
              label="Voucher Code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              error={errors.code}
              placeholder="E.g. RM5OFF"
              iconLeft={FaTicketAlt}
              required
            />

            <FormField
              as="textarea"
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              error={errors.description}
              placeholder="E.g. RM5 OFF any booking"
              rows={2}
              maxLength={255}
              required
            />

            <Row>
              <Col md={6}>
                <FormField
                  type="number"
                  label="Discount Value (RM)"
                  name="discount_value"
                  value={formData.discount_value}
                  onChange={handleChange}
                  error={errors.discount_value}
                  placeholder="Discount Value"
                  iconLeft={FaMoneyBillWave}
                  step="0.01"
                  min="0.01"
                  max="9999"
                  required
                />
              </Col>
              <Col md={6}>
                <FormField
                  type="number"
                  label="Point Cost"
                  name="point_cost"
                  value={formData.point_cost}
                  onChange={handleChange}
                  error={errors.point_cost}
                  placeholder="Point Cost"
                  iconLeft={FaCoins}
                  min="1"
                  max="9999"
                  required
                />
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <FormField
                  type="number"
                  label="Validity (Days)"
                  name="validity"
                  value={formData.validity}
                  onChange={handleChange}
                  error={errors.validity}
                  placeholder="Validity"
                  iconLeft={FaCalendarAlt}
                  min="1"
                  max="99999"
                  required
                />
              </Col>
              <Col md={6}>
                <FormField
                  type="select"
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' }
                  ]}
                  required
                />
              </Col>
            </Row>

            <Row className="mt-2 g-3">
              <Col md={isEditMode ? 6 : 12}>
                <Button type="submit" className="w-100" disabled={submitting}>
                  {submitting 
                    ? <div className="text-center"><Spinner animation="border" variant="success" /></div>
                    : (isEditMode ? 'Save Changes' : 'Create Voucher')
                  }
                </Button>
              </Col>
              
              {isEditMode && (
                <Col md={6}>
                  <Button 
                    variant="red"
                    type="button"
                    className="w-100"
                    onClick={handleDelete}
                  >
                    Delete This Voucher
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

export default VoucherFormPage;