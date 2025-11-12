import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import App from '../App';
import ProtectedRoute from './ProtectedRoute';

// Pages
import LoginPage from '../pages/auth/LoginPage';
import PlayerRegistrationPage from '../pages/auth/PlayerRegistrationPage';
import OwnerRegistrationPage from '../pages/auth/OwnerRegistrationPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import HomePage from '../pages/public/HomePage';
import BrowseVenuesPage from '../pages/public/BrowseVenuesPage';
import CourtBookingPage from '../pages/public/CourtBookingPage';
import BrowseCoachesPage from '../pages/public/BrowseCoachesPage';
import CoachDetailsPage from '../pages/public/CoachDetailsPage';
import BrowseTournamentsPage from '../pages/public/BrowseTournamentsPage';
import TournamentDetailsPage from '../pages/public/TournamentDetailsPage';
import BrowseActivitiesPage from '../pages/public/BrowseActivitiesPage';
import InfoLayout from '../components/layout/InfoLayout';
import UserProfilePage from '../pages/user/UserProfilePage';
import CoachProfilePage from '../pages/user/CoachProfilePage';
import ChangePasswordPage from '../pages/user/ChangePasswordPage';
import BookingConfirmationPage from '../pages/user/BookingConfirmationPage';
import BookingPaymentSuccessPage from '../pages/user/BookingPaymentSuccessPage';
import BookingHistoryPage from '../pages/user/BookingHistoryPage';
import WriteReviewPage from '../pages/user/WriteReviewPage';
import EditReviewPage from '../pages/user/EditReviewPage';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Routes with Navbar/Footer */}
        <Route path="/" element={<App />}>
          <Route index element={<HomePage />} />
          <Route path="venues" element={<BrowseVenuesPage />} />
          <Route path="venues/:venueId" element={<CourtBookingPage />} />
          <Route path="coaches" element={<BrowseCoachesPage />} />
          <Route path="coaches/:coachId" element={<CoachDetailsPage />} />
          <Route path="tournaments/" element={<BrowseTournamentsPage />} />
          <Route path="tournaments/:tournamentId" element={<TournamentDetailsPage />} />
          <Route path="activities" element={<BrowseActivitiesPage />} />

          {/* --- Protected Routes --- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/info" element={<InfoLayout />}>
              <Route index element={<Navigate to="user-profile" replace />} />
              <Route path="user-profile" element={<UserProfilePage />} />
              <Route path="coach-profile" element={<CoachProfilePage />} />
              <Route path="change-password" element={<ChangePasswordPage />} />
              <Route path="booking-history" element={<BookingHistoryPage />} />
            </Route>
            <Route path="/bookings/:bookingId/summary" element={<BookingConfirmationPage />} />
            <Route path="/booking-payment-success" element={<BookingPaymentSuccessPage />} />
            <Route path="/venues/:venueId/review/create" element={<WriteReviewPage />} />
            <Route path="/venues/:venueId/review/:reviewId/edit" element={<EditReviewPage />} />
          </Route>
        </Route>

        {/* Routes without Navbar/Footer */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register/player" element={<PlayerRegistrationPage />} />
        <Route path="/register/owner" element={<OwnerRegistrationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;