import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import PortalSidebar from './PortalSidebar';
import PortalNavbar from './PortalNavbar';
import './PortalLayout.css';

const PortalLayout = ({ role }) => {
  const [showSidebar, setShowSidebar] = useState(false);

  const handleToggleSidebar = () => setShowSidebar(!showSidebar);
  const handleCloseSidebar = () => setShowSidebar(false);

  return (
    <div className="portal-layout">
      <PortalSidebar 
        role={role}
        show={showSidebar}
        onHide={handleCloseSidebar}
      />
      
      <div className="portal-content-wrapper">
        <PortalNavbar onToggleSidebar={handleToggleSidebar} />
        <div className="portal-page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default PortalLayout;