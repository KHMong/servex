import React from 'react';
import { Modal } from 'react-bootstrap';
import Button from './Button';

const ShowModal = ({ text, show, onHide, path }) => {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header>
        <div className="d-flex justify-content-between align-items-center w-100">
          <Modal.Title as="h2" className="fw-semibold">{text}</Modal.Title>
          <Button onClick={onHide} variant="tertiary">Close</Button>
        </div>
      </Modal.Header>
      <Modal.Body>
        {/* Using an iframe for both images and PDFs */}
        <iframe 
          src={path} 
          title={text} 
          width="100%" 
          height="600px"
          style={{ border: 'none' }}
        />
      </Modal.Body>
    </Modal>
  );
};

export default ShowModal;