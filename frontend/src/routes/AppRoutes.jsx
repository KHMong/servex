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
import RewardsVouchersPage from '../pages/user/RewardsVouchersPage';
import RegisterTournamentPage from '../pages/user/RegisterTournamentPage';
import TournamentHistoryPage from '../pages/user/TournamentHistoryPage';
import ActivityHistoryPage from '../pages/user/ActivityHistoryPage';
import ActivityFormPage from '../pages/user/ActivityFormPage';
import CoachApplicationPage from '../pages/user/CoachApplicationPage';
import PurchasePassPage from '../pages/user/PurchasePassPage';
import PaymentStatusPage from '../pages/user/PaymentStatusPage';
import MyTrainingPage from '../pages/user/MyTrainingPage';
import PortalLayout from '../components/layout/PortalLayout';
import CoachDashboardPage from '../pages/coach/CoachDashboardPage';
import TraineeGroupsPage from '../pages/coach/TraineeGroupsPage';
import TraineeGroupFormPage from '../pages/coach/groups/TraineeGroupFormPage';
import TraineeGroupDetailsPage from '../pages/coach/groups/TraineeGroupDetailsPage';
import SessionFormPage from '../pages/coach/groups/SessionFormPage';
import SessionAttendancePage from '../pages/coach/groups/SessionAttendancePage';
import OrganiserDashboardPage from '../pages/organiser/OrganiserDashboardPage';
import OrganiserTournamentsPage from '../pages/organiser/OrganiserTournamentsPage';
import TournamentFormPage from '../pages/organiser/tournaments/TournamentFormPage';
import TournamentRegistrationsPage from '../pages/organiser/registrations/TournamentRegistrationsPage';

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

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/info" element={<InfoLayout />}>
              <Route index element={<Navigate to="user-profile" replace />} />
              <Route path="user-profile" element={<UserProfilePage />} />
              <Route path="coach-profile" element={<CoachProfilePage />} />
              <Route path="change-password" element={<ChangePasswordPage />} />
              <Route path="booking-history" element={<BookingHistoryPage />} />
              <Route path="rewards" element={<RewardsVouchersPage />} />
              <Route path="tournament-history" element={<TournamentHistoryPage />} />
              <Route path="activity-history" element={<ActivityHistoryPage />} />
            </Route>
            <Route path="/my-training" element={<MyTrainingPage />} />
            <Route path="/bookings/:bookingId/summary" element={<BookingConfirmationPage />} />
            <Route path="/booking-payment-success" element={<BookingPaymentSuccessPage />} />
            <Route path="/venues/:venueId/review/create" element={<WriteReviewPage />} />
            <Route path="/venues/:venueId/review/:reviewId/edit" element={<EditReviewPage />} />
            <Route path="/tournaments/:tournamentId/register" element={<RegisterTournamentPage />} />
            <Route path="/activities/create" element={<ActivityFormPage mode="create" />} />
            <Route path="/activities/:activityId/edit" element={<ActivityFormPage mode="edit" />} />
            <Route path="/coach/apply" element={<CoachApplicationPage />} />
            <Route path="/organiser/purchase-pass" element={<PurchasePassPage />} />
            <Route path="/payment/status" element={<PaymentStatusPage />} />
          </Route>
        </Route>

        {/* Routes without Navbar/Footer */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register/player" element={<PlayerRegistrationPage />} />
        <Route path="/register/owner" element={<OwnerRegistrationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected Routes without Navbar/Footer */}
        <Route element={<ProtectedRoute />}>
          <Route path="/coach" element={<PortalLayout role="coach" />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<CoachDashboardPage />} />
            <Route path="groups" element={<TraineeGroupsPage />} />
            <Route path="groups/create" element={<TraineeGroupFormPage mode="create" />} />
            <Route path="groups/:groupId/edit" element={<TraineeGroupFormPage mode="edit" />} />
            <Route path="groups/:groupId" element={<TraineeGroupDetailsPage />} />
            <Route path="groups/:groupId/sessions/create" element={<SessionFormPage mode="create" />} />
            <Route path="groups/:groupId/sessions/:sessionId/edit" element={<SessionFormPage mode="edit" />} />
            <Route path="groups/:groupId/sessions/:sessionId/attendance" element={<SessionAttendancePage />} />
          </Route>
          <Route path="/organiser" element={<PortalLayout role="organiser" />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<OrganiserDashboardPage />} />
            <Route path="tournaments" element={<OrganiserTournamentsPage />} />
            <Route path="tournaments/create" element={<TournamentFormPage mode="create" />} />
            <Route path="tournaments/:tournamentId/edit" element={<TournamentFormPage mode="edit" />} />
            <Route path="tournaments/:tournamentId/registrations" element={<TournamentRegistrationsPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;