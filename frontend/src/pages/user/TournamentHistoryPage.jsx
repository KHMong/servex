import React, { useState, useEffect, useCallback } from 'react';
import { Card, Tabs, Tab, Spinner, Alert } from 'react-bootstrap';
import { useNotification } from '../../contexts/NotificationContext';
import apiClient from '../../api/apiClient';
import TournamentHistoryCard from '../../components/specific/TournamentHistoryCard';
import Pagination from '../../components/common/Pagination';
import ShowModal from '../../components/common/ShowModal';
import '../../components/common/StatusTab.css';

const TournamentHistoryPage = () => {
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [registrations, setRegistrations] = useState([]);
  const [paginationData, setPaginationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resultPath, setResultPath] = useState('');
  const [showResultModal, setShowResultModal] = useState(false);
  const { showNotification } = useNotification();

  const fetchHistory = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/user/tournament-history?status=${activeTab}&page=${page}`);
      setRegistrations(response.data.data);
      setPaginationData(response.data.meta);
    } catch (err) {
        console.log(err);
      setError("Failed to load tournament history.");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

  const handlePageChange = (url) => fetchHistory(Number(new URL(url).searchParams.get('page')));

  const handleCancelRegistration = async (regId) => {
    if (window.confirm("Are you sure you want to cancel this registration?")) {
      setError(null);
      showNotification('Cancelling the registration...', 'info');
      try {
        await apiClient.put(`/tournament-registration/${regId}/cancel`);
        showNotification('Registration cancelled successfully.', 'success');
        fetchHistory(paginationData?.current_page || 1); // Refresh the current page
      } catch (err) {
        setError(err.response?.data?.message || 'Registration cancellation failed.');
      }
    }
  };

  const handleViewResult = (path) => {
    setResultPath(path);
    setShowResultModal(true);
  };

  console.log(registrations);

  const renderContent = () => {
    if (loading) return <div className="text-center p-5"><Spinner /></div>;
    if (registrations.length === 0) return <p className="text-center text-muted p-5">No registrations found for this status.</p>;

    return  (
      <>
        <div className="text-muted mb-2">
        {paginationData && paginationData.total > 0 &&
            `Showing ${paginationData.from}-${paginationData.to} of ${paginationData.total} results`
        }
        </div>
        {registrations.map(reg => (
        <TournamentHistoryCard 
            key={reg.id} 
            registration={reg}
            onCancel={activeTab === 'Upcoming' ? handleCancelRegistration : null}
            onViewResult={activeTab === 'Completed' ? handleViewResult : null}
        />
        ))}
      </>
    );
  };

  return (
    <>
      <div className="d-flex flex-column gap-2">
        <h3 className="fw-bold">Tournament History</h3>
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} id="tournament-history-tabs" className="tournament-history-tabs">
        <Tab eventKey="Upcoming" title="Upcoming" />
        <Tab eventKey="Ongoing" title="Ongoing" />
        <Tab eventKey="Completed" title="Completed" />
        <Tab eventKey="Cancelled" title="Cancelled" />
        </Tabs>
        {error && <Alert variant="danger">{error}</Alert>}
        {renderContent()}
        <div className="mt-4 d-flex justify-content-center">
        <Pagination paginationData={paginationData} onPageChange={handlePageChange} />
        </div>
      </div>
          
      <ShowModal 
        text="Tournament Result"
        show={showResultModal} 
        onHide={() => setShowResultModal(false)}
        path={resultPath}
      />
    </>
  );
};

export default TournamentHistoryPage;