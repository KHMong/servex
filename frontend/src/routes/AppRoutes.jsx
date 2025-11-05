import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import App from '../App';
import HomePage from '../pages/public/HomePage';
import BrowseVenuesPage from '../pages/public/BrowseVenuesPage';
import CourtBookingPage from '../pages/public/CourtBookingPage';
import BrowseCoachesPage from '../pages/public/BrowseCoachesPage';
import CoachProfilePage from '../pages/public/CoachProfilePage';
import BrowseTournamentsPage from '../pages/public/BrowseTournamentsPage';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<HomePage />} />
          <Route path="venues" element={<BrowseVenuesPage />} />
          <Route path="venues/:venueId" element={<CourtBookingPage />} />
          <Route path="coaches" element={<BrowseCoachesPage />} />
          <Route path="coaches/:coachId" element={<CoachProfilePage />} />
          <Route path="tournaments/" element={<BrowseTournamentsPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;