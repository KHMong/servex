import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Tabs, Tab, Spinner, Alert } from 'react-bootstrap';
import apiClient from '../../api/apiClient';
import Pagination from '../../components/common/Pagination';
import EnrolledGroupCard from '../../components/specific/PlayerGroupCard';
import PlayerSessionCard from '../../components/specific/PlayerSessionCard';

const MyTrainingPage = () => {
  // --- Groups State ---
  const [groups, setGroups] = useState([]);
  const [groupPagination, setGroupPagination] = useState(null);
  const [groupPage, setGroupPage] = useState(1);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [groupError, setGroupError] = useState('');

  // --- Sessions State ---
  const [sessions, setSessions] = useState([]);
  const [sessionPagination, setSessionPagination] = useState(null);
  const [sessionTab, setSessionTab] = useState('Upcoming');
  const [sessionPage, setSessionPage] = useState(1);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [sessionError, setSessionError] = useState('');

  // Fetch Groups
  useEffect(() => {
    setLoadingGroups(true);
    apiClient.get(`/player/training/groups?page=${groupPage}`)
      .then(res => {
        setGroups(res.data.data);
        setGroupPagination(res.data.meta);
      })
      .catch(() => setGroupError("Failed to load groups."))
      .finally(() => setLoadingGroups(false));
  }, [groupPage]);

  // Fetch Sessions
  useEffect(() => {
    setLoadingSessions(true);
    apiClient.get(`/player/training/sessions?status=${sessionTab}&page=${sessionPage}`)
      .then(res => {
        setSessions(res.data.data);
        setSessionPagination(res.data.meta);
      })
      .catch(() => setSessionError("Failed to load sessions."))
      .finally(() => setLoadingSessions(false));
  }, [sessionTab, sessionPage]);


  return (
    <Container className="py-5">
      <h1 className="fw-bold mb-5">My Training Groups & Sessions</h1>

      {/* Groups */}
      <section className="mb-4">
        <h3 className="fw-bold mb-3">My Enrolled Groups</h3>
        {groupError && <Alert variant="danger">{groupError}</Alert>}
        {loadingGroups ? (
          <div className="text-center p-4"><Spinner animation="border" variant="success" /></div>
        ) : groups.length > 0 ? (
          <>
            <div className="text-muted my-3">
                {groupPagination && groupPagination.total > 0 &&
                `Showing ${groupPagination.from}-${groupPagination.to} of ${groupPagination.total} results`
                }
            </div>
            <Row>
              {groups.map(group => (
                <Col md={4} key={group.id}>
                  <EnrolledGroupCard group={group} />
                </Col>
              ))}
            </Row>
            <div className="mt-5 d-flex justify-content-center">
              <Pagination 
                paginationData={groupPagination} 
                onPageChange={(url) => setGroupPage(Number(new URL(url).searchParams.get('page')))} 
              />
            </div>
          </>
        ) : (
          <p className="text-center text-muted p-4">You are not enrolled in any training groups.</p>
        )}
      </section>

      {/* Sessions */}
      <section>
        <h3 className="fw-bold mb-3">My Training Sessions</h3>
        {sessionError && <Alert variant="danger">{sessionError}</Alert>}
        
        <Tabs 
          activeKey={sessionTab} 
          onSelect={(k) => { setSessionTab(k); setSessionPage(1); }} 
          className="mb-4"
        >
          <Tab eventKey="Upcoming" title="Upcoming" />
          <Tab eventKey="Completed" title="Completed" />
        </Tabs>

        {loadingSessions ? (
          <div className="text-center p-4"><Spinner animation="border" variant="success" /></div>
        ) : sessions.length > 0 ? (
          <>
            <div className="text-muted my-3">
                {sessionPagination && sessionPagination.total > 0 &&
                `Showing ${sessionPagination.from}-${sessionPagination.to} of ${sessionPagination.total} results`
                }
            </div>
            {sessions.map(session => (
              <PlayerSessionCard 
                key={session.id} 
                session={session} 
                isCompleted={sessionTab === 'Completed'} 
              />
            ))}
            <div className="mt-5 d-flex justify-content-center">
              <Pagination 
                paginationData={sessionPagination} 
                onPageChange={(url) => setSessionPage(Number(new URL(url).searchParams.get('page')))} 
              />
            </div>
          </>
        ) : (
          <p className="text-center text-muted p-4">
            No sessions found for this status.
          </p>
        )}
      </section>
    </Container>
  );
};

export default MyTrainingPage;