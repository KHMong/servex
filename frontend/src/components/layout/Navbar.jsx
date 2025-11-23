import React from 'react';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import { getImageUrl } from '../../utils/imageUrl';
import logo from '../../assets/images/logo.png'; 
import './Navbar.css';

const NavbarComponent = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const imageUrl = getImageUrl(user?.photo_path);

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

          {/* Authentication Section */}
          <Nav className="align-items-center gap-3">
            {isAuthenticated ? (
              // Logged in
              <Dropdown as={Nav.Item} align="end">
                <Dropdown.Toggle as="div" id="user-nav-dropdown" className="user-dropdown-toggle">
                  <img src={imageUrl} alt={user?.name} className="user-avatar" />
                  <div className="user-info-container">
                    <span className="user-role-badge">{user.role?.toUpperCase() || 'N/A'}</span>
                    <span className="user-name-text">{user.name}</span>
                  </div>
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/info">Info</Dropdown.Item>
                  {user.role === 'Player' && (
                    <Dropdown.Item as={Link} to="/my-training">My Training</Dropdown.Item>
                  )}
                  {user.is_coach && (
                    <Dropdown.Item as={Link} to="/coach">Coach Portal</Dropdown.Item>
                  )}
                  <Dropdown.Divider />
                  <Dropdown.Item as="button" onClick={handleLogout} className="text-danger">
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

            ) : (
              // Not logged in
              <>
                <Button as={Link} to="/login">Login</Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;