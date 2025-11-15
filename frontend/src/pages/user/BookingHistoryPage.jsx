import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, Tab, Spinner, Alert } from 'react-bootstrap';
import { useNotification } from '../../contexts/NotificationContext';
import apiClient from '../../api/apiClient';
import BookingHistoryCard from '../../components/specific/BookingHistoryCard';
import Pagination from '../../components/common/Pagination';
import '../../components/common/StatusTab.css';

const statusMap = {
  upcoming: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const BookingHistoryPage = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [paginationData, setPaginationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showNotification } = useNotification();

  const fetchBookings = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const status = statusMap[activeTab];
      const response = await apiClient.get(`/user/bookings?status=${status}&page=${page}`);
      setBookings(response.data.data);
      setPaginationData(response.data.meta);
    } catch (err) {
      setError("Failed to load booking history.");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchBookings(1); // Go to page 1 when change tab
  }, [fetchBookings]);

  const handlePageChange = (url) => {
    const pageNumber = new URL(url).searchParams.get('page');
    fetchBookings(Number(pageNumber));
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      setError(null);
      showNotification('Cancelling the booking...', 'info');
      try {
        await apiClient.put(`/bookings/${bookingId}/cancel`);
        showNotification('Booking cancelled successfully.', 'success');
        fetchBookings(paginationData?.current_page || 1); // Refresh the current page
      } catch (err) {
        setError(err.response?.data?.message || 'Booking cancellation failed.');
      }
    }
  };

  const renderContent = () => {
    if (loading) return <div className="text-center p-5"><Spinner /></div>;
    if (bookings.length === 0) return <p className="text-center text-muted p-5">No bookings found for this status.</p>;

    return (
      <>
        <div className="text-muted mb-2">
          {paginationData && paginationData.total > 0 &&
            `Showing ${paginationData.from}-${paginationData.to} of ${paginationData.total} results`
          }
        </div>
        {bookings.map(booking => (
          <BookingHistoryCard 
            key={booking.id} 
            booking={booking} 
            onCancel={handleCancelBooking} 
          />
        ))}
      </>
    );    
  };

  return (
    <div className="d-flex flex-column gap-2">
      <h3 className="fw-bold">Booking History</h3>
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} id="booking-history-tabs" className="booking-history-tabs">
        <Tab eventKey="upcoming" title="Upcoming" />
        <Tab eventKey="completed" title="Completed" />
        <Tab eventKey="cancelled" title="Cancelled" />
      </Tabs>
      {error && <Alert variant="danger">{error}</Alert>}
      {renderContent()}
      <div className="mt-4 d-flex justify-content-center">
        <Pagination paginationData={paginationData} onPageChange={handlePageChange} />
      </div>
    </div>
  );
};

export default BookingHistoryPage;