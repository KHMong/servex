import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import App from '../App';
import HomePage from '../pages/public/HomePage';
import BrowseVenuesPage from '../pages/public/BrowseVenuesPage';
import CourtBookingPage from '../pages/public/CourtBookingPage';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<HomePage />} />
          <Route path="venues" element={<BrowseVenuesPage />} />
          <Route path="venues/:venueId" element={<CourtBookingPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;