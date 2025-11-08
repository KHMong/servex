import React from 'react';
import { Container, Card } from 'react-bootstrap';
import './AuthLayout.css';

const AuthLayout = ({ children, size = 'default', footer }) => {
  const cardClassName = `border auth-card ${size === 'large' ? 'auth-card-large' : ''}`;

  return (
    <div className="auth-wrapper py-5">
      <Container className="d-flex justify-content-center">
        <Card className={cardClassName}>
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