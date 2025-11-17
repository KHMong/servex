import React, { useState } from 'react';
import { Modal, Table, Spinner } from 'react-bootstrap';
import Button from '../common/Button';
import { FaTrash } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/apiClient';
import { getImageUrl } from '../../utils/imageUrl';

const ParticipantsModal = ({ show, onHide, activityId, onRemoveParticipant }) => {
  const { user } = useAuth();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (show && activityId) {
      setLoading(true);
      apiClient.get(`/activities/${activityId}/participants`)
        .then(res => {
          setParticipants(res.data.data);
        })
        .finally(() => setLoading(false));
    }
  }, [show, activityId]);

  const currentUserIsHost = participants.find(p => p.id === user.id)?.is_host;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered scrollable={true}>
      <Modal.Header>
        <div className="d-flex justify-content-between align-items-center w-100">
          <Modal.Title as="h3" className="fw-semibold">Activity Participants</Modal.Title>
          <Button onClick={onHide} variant="tertiary">Close</Button>
        </div>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '60vh' }}>
        {loading ? <div className="text-center p-5"><Spinner /></div> : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>No.</th>
                <th>Participant</th>
                <th>Gender</th>
                <th>Phone No</th>
                {currentUserIsHost && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {participants.map((p, index) => (
                <tr key={p.id}>
                  <td>{index + 1}</td>
                  <td>
                    <img src={getImageUrl(p.photo_path)} alt={p.name} className="rounded-circle object-fit-cover me-2" style={{ width: '40px', height: '40px', border: '2px solid var(--servex-light-gray-bg)'}} />
                    {p.name} {p.is_host && <span className="host-badge fw-semibold">(Host)</span>}
                  </td>
                  <td>{p.gender === 'M' ? 'Male' : 'Female'}</td>
                  <td>{p.phone_no}</td>
                  {currentUserIsHost && (
                    <td className="text-center">
                      {!p.is_host && (
                        <Button variant="red" size="sm" onClick={() => onRemoveParticipant(p.participant_id)}>
                          <FaTrash />
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ParticipantsModal;