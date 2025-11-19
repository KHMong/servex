import React from 'react';
import { Navbar, Button } from 'react-bootstrap';
import { FaBars } from 'react-icons/fa';

const PortalNavbar = ({ onToggleSidebar }) => {
  return (
    <Navbar bg="white" className="d-md-none mb-3 shadow-sm">
      <Button variant="light" onClick={onToggleSidebar}>
        <FaBars />
      </Button>
    </Navbar>
  );
};

export default PortalNavbar;