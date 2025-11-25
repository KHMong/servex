import React from 'react';
import { Nav, Offcanvas } from 'react-bootstrap';
import { NavLink, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './PortalSidebar.css';

const SidebarContent = ({ role }) => {
  const getLinks = () => {
    switch (role) {
      case 'coach':
        return [
          { to: '/coach/dashboard', text: 'Dashboard' },
          { to: '/coach/groups', text: 'Trainee Groups' },
        ];
      case 'organiser':
        return [
          { to: '/organiser/dashboard', text: 'Dashboard' },
          { to: '/organiser/tournaments', text: 'Tournaments' },
        ];
      case 'owner':
        return [
          { to: '/owner/dashboard', text: 'Dashboard' },
          { to: '/owner/venues', text: 'Venues' },
        ];
      default:
        return [];
    }
  };

  return (
    <>
      <div className="sidebar-header">
        <Link to="/" className="back-to-site-link">
          <FaArrowLeft className="me-2" /> Back to Main Site
        </Link>
      </div>
      <Nav className="flex-column">
        {getLinks().map(link => (
          <Nav.Link as={NavLink} to={link.to} key={link.to} end>
            {link.text}
          </Nav.Link>
        ))}
      </Nav>
    </>
  );
};

const PortalSidebar = ({ role, show, onHide }) => {
  return (
    <>
      {/* For medium screen or larger */}
      <div className="portal-sidebar d-none d-md-block">
        <SidebarContent role={role} />
      </div>

      {/* For small screen */}
      <Offcanvas show={show} onHide={onHide} className="portal-sidebar d-md-none">
        <Offcanvas.Header closeButton closeVariant="white" />
        <Offcanvas.Body>
          <SidebarContent role={role} />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default PortalSidebar;