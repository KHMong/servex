import React from 'react';
import { Container } from 'react-bootstrap';
import './Footer.css';

const Footer = () => {
  // Get current year 
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-container">
      <Container className="text-center">
        <p>
          &copy; {currentYear} ServeX. All rights reserved.
        </p>
      </Container>
    </footer>
  );
};

export default Footer;