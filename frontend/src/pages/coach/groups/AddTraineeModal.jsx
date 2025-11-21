import React, { useState } from 'react';
import { Modal, Spinner, Alert, Form } from 'react-bootstrap';
import { FaIdCard } from 'react-icons/fa';
import apiClient from '../../../api/apiClient';
import FormField from '../../../components/common/FormField';
import Button from '../../../components/common/Button';

const AddTraineeModal = ({ show, onHide, groupId, onSuccess }) => {
  const [playerId, setPlayerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!/^P\d{10}$/.test(playerId)) {
      setError('Player ID must start with "P" followed by 10 digits.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post(`/coach/groups/${groupId}/trainees`, { player_id: playerId });
      onSuccess();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add trainee.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPlayerId('');
    setError('');
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header>
        <div className="d-flex justify-content-between align-items-center w-100">
            <Modal.Title className="fw-semibold">Add New Trainee</Modal.Title>
            <Button onClick={onHide} variant="tertiary">Close</Button>
        </div>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {error && <Alert variant="danger" className="py-2 text-center">{error}</Alert>}
          <FormField
            label="Player ID"
            name="player_id"
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            placeholder="Player ID"
            iconLeft={FaIdCard}
            required
            maxLength={11}
          />
          <Button type="submit" className="w-100 mt-2" disabled={loading}>
            {loading ? <div className="text-center"><Spinner animation="border" variant="success" size="sm" /></div> : 'Add Trainee'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddTraineeModal;