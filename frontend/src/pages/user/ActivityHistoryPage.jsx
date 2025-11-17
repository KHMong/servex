import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, Tab, Spinner, Alert } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import { useNotification } from '../../contexts/NotificationContext';
import apiClient from '../../api/apiClient';
import Button from '../../components/common/Button';
import ActivityHistoryCard from '../../components/specific/ActivityHistoryCard';
import Pagination from '../../components/common/Pagination';
import '../../components/common/StatusTab.css';

const ActivityHistoryPage = () => {
  const [activeTab, setActiveTab] = useState('Joining');
  const [activities, setActivities] = useState([]);
  const [paginationData, setPaginationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showNotification } = useNotification();

  const fetchHistory = useCallback(async (page = 1) => { 
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/user/activity-history?status=${activeTab}&page=${page}`);
      setActivities(response.data.data);
      setPaginationData(response.data.meta);
    } catch (err) {
      setError("Failed to load activity history.");
    } finally {
      setLoading(false);
    } 
  }, [activeTab]);

  useEffect(() => { 
    fetchHistory(1); // Go to page 1 when change tab
  }, [fetchHistory]);

  const handlePageChange = (url) => { 
    const pageNumber = new URL(url).searchParams.get('page');
    fetchHistory(Number(pageNumber));
  };
  
  const handleLeave = async (activityId) => { 
    if (window.confirm("Are you sure you want to leave this activity?")) {
      setError(null);
      showNotification('Leaving the activity...', 'info');
      try {
        await apiClient.post(`/activities/${activityId}/leave`);
        showNotification('You have left the activity.', 'success');
        fetchHistory(paginationData?.current_page || 1); // Refresh the current page
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to leave the activity.');
      }
    }
  };
  const handleCancel = async (activityId) => { 
    if (window.confirm("Are you sure you want to cancel this activity?")) {
      setError(null);
      showNotification('Cancelling the activity...', 'info');
      try {
        await apiClient.put(`/activities/${activityId}/cancel`);
        showNotification('Activity cancelled successfully.', 'success');
        fetchHistory(paginationData?.current_page || 1); // Refresh the current page
      } catch (err) {
        setError(err.response?.data?.message || 'Activity cancellation failed.');
      }
    } 
  };

  const renderContent = () => {
    if (loading) return <div className="text-center p-5"><Spinner /></div>;
    if (activities.length === 0) return <p className="text-center text-muted p-5">No activities found for this status.</p>;

    return (
      <>
        <div className="text-muted mb-2">
        {paginationData && paginationData.total > 0 &&
            `Showing ${paginationData.from}-${paginationData.to} of ${paginationData.total} results`
        }
        </div>
        {activities.map(act => (
        <ActivityHistoryCard
            key={act.id}
            activity={act}
            onLeave={activeTab === 'Joining' ? handleLeave : null}
            onCancel={activeTab === 'Hosting' ? handleCancel : null}
        />
        ))}
      </>
    );
  };

  return (
    <div className="d-flex flex-column gap-2">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h3 className="fw-bold">Activity History</h3>
          <Button to="/activities/create" icon={<FaPlus />}>Create New Activity</Button>
        </div>
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} id="activity-history-tabs" className="activity-history-tabs">
          <Tab eventKey="Joining" title="Joining" />
          <Tab eventKey="Joined" title="Joined" />
          <Tab eventKey="Hosting" title="Hosting" />
          <Tab eventKey="Hosted" title="Hosted" />
          <Tab eventKey="Cancelled" title="Cancelled" />
        </Tabs>
        {error && <Alert variant="danger">{error}</Alert>}
        {renderContent()}
        <div className="mt-4 d-flex justify-content-center">
          <Pagination paginationData={paginationData} onPageChange={handlePageChange} />
        </div>
    </div>
  );
};

export default ActivityHistoryPage;