import React from 'react';
import { Nav, Card } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './InfoSidebar.css';

const InfoSidebar = () => {
  const { user } = useAuth();

  return (
    <Nav as={Card} className="flex-column info-sidebar shadow-sm">
      <Nav.Link as={NavLink} to="/info/user-profile">Profile Details</Nav.Link>
      
      {user?.is_coach && (
        <Nav.Link as={NavLink} to="/info/coach-profile">Coach Profile</Nav.Link>
      )}

      <Nav.Link as={NavLink} to="/info/change-password">Change Password</Nav.Link>

      {user?.role === 'Player' && (
        <>
          <Nav.Link as={NavLink} to="/info/rewards">Rewards & Vouchers</Nav.Link>
          <Nav.Link as={NavLink} to="/info/booking-history">Booking History</Nav.Link>
          <Nav.Link as={NavLink} to="/info/activity-history">Activity History</Nav.Link>
          <Nav.Link as={NavLink} to="/info/tournament-history">Tournament History</Nav.Link>
        </>
      )}
    </Nav>
  );
};

export default InfoSidebar;