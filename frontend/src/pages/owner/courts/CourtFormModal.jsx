import React, { useState, useEffect } from 'react';
import { Modal, Form, Spinner, Alert } from 'react-bootstrap';
import FormField from '../../../components/common/FormField';
import Button from '../../../components/common/Button';

const CourtFormModal = ({ show, onHide, onSubmit, courtToEdit, submitting }) => {
  const isEditMode = !!courtToEdit;
  const [formData, setFormData] = useState({ name: '', status: 'Available' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (courtToEdit) {
      setFormData({ name: courtToEdit.name, status: courtToEdit.status });
    } else {
      setFormData({ name: '', status: 'Available' });
    }
  }, [courtToEdit, show]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name) {
        return setError("Court Name is required.");
    }

    onSubmit(formData);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header className="flex-column align-items-start">
        <div className="d-flex justify-content-between align-items-center w-100">
            <Modal.Title as="h2" className="fw-semibold">{isEditMode ? 'Edit Your Court' : 'Add New Court'}</Modal.Title>
            <Button onClick={onHide} variant="tertiary">Close</Button>
        </div>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <FormField 
            label="Court Name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            placeholder="Court Name" 
            required 
            maxLength={255}
          />

          {/* Only show Status in Edit Mode */}
          {isEditMode && (
            <FormField 
              label="Status" 
              type="select" 
              name="status" 
              value={formData.status} 
              onChange={handleChange} 
              options={[
                { value: 'Available', label: 'Available' },
                { value: 'Maintenance', label: 'Maintenance' },
              ]}
              required 
            />
          )}

          {error && <Alert variant="danger">{error}</Alert>}

          <div className="mt-4">
            <Button type="submit" className="w-100" disabled={submitting}>
              {submitting ? <div className="text-center"><Spinner animation="border" variant="success" /></div> : (isEditMode ? 'Save Changes' : 'Add Court')}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CourtFormModal;