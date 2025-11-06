import React from 'react';
import { Container, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './AuthLayout.css';

const AuthLayout = ({ children, footer }) => {
  return (
    <div className="auth-wrapper">
      <Container className="d-flex justify-content-center">
        <Card className="auth-card border">
          <Card.Body>{children}</Card.Body>
        </Card>
      </Container>

      {footer && (
        <div className="text-center">
          {footer}
        </div>
      )}
    </div>
  );
};

export default AuthLayout;