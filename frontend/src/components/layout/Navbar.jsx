import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { NavLink, Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import logo from '../../assets/images/logo.png'; 
import './Navbar.css';

const NavbarComponent = () => {
  return (
    <Navbar bg="#F8FAFC" expand="lg" className="shadow-sm py-3">
      <Container fluid className="px-5">
        {/* Logo and Brand Name */}
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img
            src={logo}
            width="50"
            height="50"
            className="d-inline-block align-top me-3"
            alt="ServeX logo"
          />
          <span className="fw-bold">ServeX</span>
        </Navbar.Brand>

        {/* Mobile Toggle Button */}
        <Navbar.Toggle aria-controls="main-navbar-nav" />

        {/* Collapsible Content */}
        <Navbar.Collapse id="main-navbar-nav">
          {/* Centered Navigation Links */}
          <Nav className="mx-auto">
            <Nav.Link as={NavLink} to="/venues"><span>Venues</span></Nav.Link>
            <Nav.Link as={NavLink} to="/coaches"><span>Coaches</span></Nav.Link>
            <Nav.Link as={NavLink} to="/tournaments"><span>Tournaments</span></Nav.Link>
            <Nav.Link as={NavLink} to="/activities"><span>Activities</span></Nav.Link>
          </Nav>

          {/* Authentication Buttons */}
          <Nav className="align-items-center">
            <Nav.Link as={Link} to="/login" className="me-3">Login</Nav.Link>
            <Button to="/register">Register</Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;