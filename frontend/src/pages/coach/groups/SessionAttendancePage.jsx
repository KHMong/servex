import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Form, Spinner, Alert } from 'react-bootstrap';

import apiClient from '../../../api/apiClient';
import { useNotification } from '../../../contexts/NotificationContext';
import Pagination from '../../../components/common/Pagination';
import BackButton from '../../../components/common/BackButton';
import Button from '../../../components/common/Button';
import { getImageUrl } from '../../../utils/imageUrl';
import './SessionAttendancePage.css';

const SessionAttendancePage = () => {
  const { sessionId } = useParams();
  const { showNotification } = useNotification();

  const [sessionInfo, setSessionInfo] = useState(null);
  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingComments, setSavingComments] = useState(false);

  const [paginationData, setPaginationData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
        const res = await apiClient.get(`/coach/sessions/${sessionId}/attendance?page=${currentPage}`);
        setSessionInfo(res.data.session);
        setTrainees(res.data.trainees.data);
        setPaginationData(res.data.trainees);
    } catch (err) {
        setError("Failed to load attendance data.", "error");
    } finally {
        setLoading(false);
    }
  }, [sessionId, currentPage]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  // Instant update when toggle
  const handleToggle = async (memberId, currentStatus) => {
    const newStatus = !currentStatus;

    // Update UI immediately
    setTrainees(prev => prev.map(a => 
      a.member_id === memberId ? { ...a, is_present: newStatus } : a
    ));

    try {
      await apiClient.put(`/coach/sessions/${sessionId}/attendance/update`, {
        member_id: memberId,
        is_present: newStatus
      });
    } catch (err) {
      // Revert when fail
      setTrainees(prev => prev.map(a => 
        a.member_id === memberId ? { ...a, is_present: currentStatus } : a
      ));
      showNotification("Failed to update attendance.", "error");
    }
  };

  // Batch Update
  // Check if everyone is marked present
  const allPresent = useMemo(() => {
    return trainees.length > 0 && trainees.every(a => a.is_present);
  }, [trainees]);

  const handleBatchToggle = async () => {
    const confirmMsg = allPresent 
      ? "Are you sure you want to mark everyone as Absent?" 
      : "Are you sure you want to mark everyone as Present?";

    if (window.confirm(confirmMsg)) {
      const newStatus = !allPresent;
      
      setTrainees(prev => prev.map(a => ({ ...a, is_present: newStatus })));

      try {
        await apiClient.put(`/coach/sessions/${sessionId}/attendance/batch`, {
          mark_all_present: newStatus
        });
        showNotification(`All marked as ${newStatus ? 'Present' : 'Absent'}.`, 'success');
      } catch (err) {
        // Revert when fail
        showNotification("Batch update failed.", "error");
        fetchData(); 
      }
    }
  };

  // Comments
  const handleCommentChange = (memberId, value) => {
    setTrainees(prev => prev.map(a => 
      a.member_id === memberId ? { ...a, comment: value } : a
    ));
  };

  const handleSaveComments = async () => {
    setSavingComments(true);
    try {
      // Format data for backend
      const payload = trainees.map(a => ({
        member_id: a.member_id,
        text: a.comment
      }));

      await apiClient.post(`/coach/sessions/${sessionId}/comments`, { comments: payload });
      showNotification("Comments saved successfully!", "success");
    } catch (err) {
      showNotification("Failed to save comments.", "error");
    } finally {
      setSavingComments(false);
    }
  };

  if (loading) return <div className="text-center p-5"><Spinner animation="border" variant="success" /></div>;
  if (!sessionInfo) return <Alert variant="danger">Session not found.</Alert>;

  return (
    <>
        <BackButton 
            to={`/coach/groups/${sessionInfo.group_id}`} 
            place="Trainee Group Details" 
        />

        <div className="mb-4">
            <h1 className="fw-bold mb-2">Session Attendance & Notes</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            <p className="text-muted fs-5">
            For session: <span className="fw-semibold text-dark">{sessionInfo.name}</span> on {sessionInfo.date_time}
            </p>
        </div>
        
        <div className="d-flex gap-4">
            {/* Check/Uncheck All */}
            <div>
                <Button 
                    variant="tertiary" 
                    size="sm" 
                    onClick={handleBatchToggle}
                >
                    {allPresent ? "Uncheck All" : "Check All"}
                </Button>
            </div>

            {/* Save Comments */}
            <div>
                <Button 
                    onClick={handleSaveComments} 
                    disabled={savingComments}
                    className="w-100"
                >
                    {savingComments ? <div className="text-center"><Spinner animation="border" variant="success" size="sm" /></div> : 'Save Comments'}
                </Button>
            </div>
        </div>
        

        <div className="text-muted my-3">
            {paginationData && paginationData.total > 0 &&
            `Showing ${paginationData.from}-${paginationData.to} of ${paginationData.total} results`
            }
        </div>

        {/* Custom Table */}
        <div className="table-responsive shadow-sm border rounded bg-white">
            <Table hover className="mb-0 align-middle attendance-table">
                <thead className="bg-light">
                <tr>
                    <th style={{width: '10%'}} className="py-3 text-center">Attendance</th>
                    <th style={{width: '30%'}} className="py-3">Trainee</th>
                    <th style={{width: '60%'}} className="py-3">Comment</th>
                </tr>
                </thead>
                <tbody>
                {trainees.map((trainee) => (
                    <tr key={trainee.member_id}>
                    <td className="py-3 text-center">
                        <Form.Check 
                        type="checkbox"
                        className="attendance-checkbox"
                        checked={trainee.is_present}
                        onChange={() => handleToggle(trainee.member_id, trainee.is_present)}
                        />
                    </td>
                    <td className="py-3">
                        <div className="d-flex align-items-center">
                        <img 
                            src={getImageUrl(trainee.photo_path)} 
                            alt={trainee.name} 
                            className="rounded-circle me-3" 
                            width="40" height="40" 
                            style={{objectFit: 'cover', border: '2px solid var(--servex-light-gray-bg)'}} 
                        />
                        <span className="fw-semibold">{trainee.name}</span>
                        </div>
                    </td>
                    <td className="py-3">
                        <Form.Control
                        as="textarea"
                        rows={1}
                        placeholder="Add a comment on his/her performance..."
                        value={trainee.comment || ''}
                        onChange={(e) => handleCommentChange(trainee.member_id, e.target.value)}
                        className="comment-input"
                        />
                    </td>
                    </tr>
                ))}
                </tbody>
            </Table>
        </div>

        {/* Pagination */}
        <div className="mt-5 d-flex justify-content-center">
            <Pagination 
            paginationData={paginationData} 
            onPageChange={(url) => setCurrentPage(Number(new URL(url).searchParams.get('page')))} 
            />
        </div>
    </>
  );
};

export default SessionAttendancePage;