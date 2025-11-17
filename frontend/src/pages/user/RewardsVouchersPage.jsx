import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Tabs, Tab, Spinner, Alert } from 'react-bootstrap';
import { useNotification } from '../../contexts/NotificationContext';
import apiClient from '../../api/apiClient';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import './RewardsVouchersPage.css';

const RewardsVouchersPage = () => {
  const [points, setPoints] = useState(0);
  const [activeVouchers, setActiveVouchers] = useState({ items: [], pagination: null });
  const [userVouchers, setUserVouchers] = useState({ items: [], pagination: null });
  const [activeTab, setActiveTab] = useState('Available');
  const [loading, setLoading] = useState({ page: true, activeVouchers: false, userVouchers: false, redeem: null });
  const [voucherError, setVoucherError] = useState('');
  const [redeemError, setRedeemError] = useState('');
  const { showNotification } = useNotification();

  // Fetch active voucher when tab and page changes
  const fetchActiveVouchers = useCallback(async (page = 1) => {
    setLoading(prev => ({ ...prev, activeVouchers: true }));
    try {
      const res = await apiClient.get(`/rewards?page=${page}`);
      
      setActiveVouchers({ 
        items: res.data.data, 
        pagination: res.data.meta
      });

      setPoints(res.data.points);

    } catch (err) {
      setRedeemError("Failed to load redeemable vouchers.");
    } finally {
      setLoading(prev => ({ ...prev, activeVouchers: false }));
    }
  }, []);

  // Fetch user points and active vouchers
  useEffect(() => {
    setLoading(prev => ({ ...prev, page: true }));
    setVoucherError(null);
    setRedeemError(null);
    fetchActiveVouchers(1).finally(() => {
      setLoading(prev => ({ ...prev, page: false }));
    });
  }, [fetchActiveVouchers]);

  // Fetch user's voucher history when tab and page changes
  const fetchUserVouchers = useCallback(async (page = 1) => {
    setLoading(prev => ({ ...prev, userVouchers: true }));
    try {
      const res = await apiClient.get(`/user/voucher-history?status=${activeTab}&page=${page}`);

      setUserVouchers({ 
        items: res.data.data, 
        pagination: res.data.meta
      });
    } catch (err) {
      setVoucherError("Failed to load your vouchers.");
    } finally {
      setLoading(prev => ({ ...prev, userVouchers: false }));
    }
  }, [activeTab]);

  useEffect(() => {
    fetchUserVouchers(1);
  }, [fetchUserVouchers]);

  const handleRedeem = async (voucherId) => {
    if (window.confirm("Are you sure you want to redeem this voucher?")) {
        setLoading(prev => ({ ...prev, redeem: voucherId }));
        setRedeemError(null);
        showNotification('Redeeming the voucher...', 'info');
        try {
            const res = await apiClient.post(`/vouchers/${voucherId}/redeem`);
            setPoints(res.data.new_points); // Update points balance
            showNotification('Voucher redeemed successfully.', 'success');
            if (activeTab === 'Available') { // Refresh the 'Available' tab if currently viewing it
                fetchUserVouchers(1);
            }
        } catch (err) {
            setRedeemError("Failed to redeem the voucher.");
        } finally {
            setLoading(prev => ({ ...prev, redeem: null }));
        }
    }
    
  };

  if (loading.page) return <div className="text-center p-5"><Spinner /></div>;

  return (
    <div className="d-flex flex-column gap-2">
        <h3 className="fw-bold">Rewards & Vouchers</h3>
        {/* Points Balance */}
        <Card className="p-4 border-0 shadow-sm">
            <h4 className="fw-semibold text-muted">My Points Balance</h4>
            <div className="points-display">{points.toLocaleString()}</div>
        </Card>
        <div className="d-flex flex-column gap-4 mt-5">
            {/* Redeem Vouchers */}
            <section>
                <h4 className="fw-semibold">Redeem Vouchers</h4>
                {redeemError && <Alert variant="danger">{redeemError}</Alert>}
                {loading.activeVouchers ? <div className="text-center p-5"><Spinner /></div> : (
                  activeVouchers.items.length > 0 ? (
                  <>
                    <div className="text-muted">
                      {activeVouchers.pagination && activeVouchers.pagination.total > 0 &&
                        `Showing ${activeVouchers.pagination.from}-${activeVouchers.pagination.to} of ${activeVouchers.pagination.total} results`
                      }
                    </div>

                    <Row className="g-3 mt-1">
                        {activeVouchers.items.map(v => (
                        <Col key={v.id} md={4}>
                            <Card className="border shadow-sm">
                                <Card.Header className="fw-bold">{v.description}</Card.Header>
                                <Card.Body className="d-flex flex-column justify-content-between gap-3">
                                    <div className="d-flex justify-content-between gap-2">
                                        <div className="d-flex flex-column">
                                            <small className="text-muted"><strong>Code:</strong> {v.code}</small>
                                            <small className="text-muted"><strong>Discount:</strong> RM {v.discount_value}</small>
                                            <small className="text-muted"><strong>Validity:</strong> {v.validity} days</small>
                                        </div>
                                        <small className="fw-semibold">{v.point_cost} points</small>
                                    </div>
                                    
                                    <Button variant="tertiary" onClick={() => handleRedeem(v.id)} disabled={loading.redeem === v.id || points < v.point_cost}>
                                        {loading.redeem === v.id ? <div className="text-center"><Spinner animation="border" variant="success" /></div> : 'Redeem'}
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                        ))
                        }
                    </Row>
                  </>
                  ) : <p className="text-muted text-center p-4">No redeemable vouchers.</p>
                )}

                <div className="mt-4 d-flex justify-content-center">
                    <Pagination paginationData={activeVouchers.pagination} onPageChange={(url) => fetchActiveVouchers(new URL(url).searchParams.get('page'))} />
                </div>
            </section>

            {/* My Vouchers */}
            <section>
                <h4 className="fw-semibold">My Vouchers</h4>
                {voucherError && <Alert variant="danger">{voucherError}</Alert>}
                <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} id="my-vouchers-tabs" className="my-vouchers-tabs mt-3 mb-3">
                    <Tab eventKey="Available" title="Available" />
                    <Tab eventKey="Used" title="Used" />
                    <Tab eventKey="Expired" title="Expired" />
                </Tabs>
                
                <div className="d-flex flex-column gap-4">
                    {loading.userVouchers ? <div className="text-center p-5"><Spinner /></div> : (
                        userVouchers.items.length > 0 ? (
                          <>
                            <div className="text-muted">
                              {userVouchers.pagination && userVouchers.pagination.total > 0 &&
                                `Showing ${userVouchers.pagination.from}-${userVouchers.pagination.to} of ${userVouchers.pagination.total} results`
                              }
                            </div>
                            {userVouchers.items.map(vh => (
                              <Card key={vh.id} className="border shadow-sm">
                                <Card.Header className="fw-bold h5">Voucher Id: {vh.id}</Card.Header>
                                <Card.Body className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="mb-1 text-muted"><strong>Code:</strong> {vh.voucher.code}</p>
                                        <p className="mb-1 text-muted"><strong>Description:</strong> {vh.voucher.description}</p>
                                        <p className="mb-0 text-muted"><strong>Discount:</strong> RM {vh.voucher.discount_value}</p>
                                    </div>
                                    {activeTab === 'Available' && <div className="expiry-date">Expires on: {vh.expires_on}</div>}
                                    {activeTab === 'Used' && <div className="expiry-date">Used on: {vh.booking_date}</div>}
                                    {activeTab === 'Expired' && <div className="expiry-date">Expired on: {vh.expires_on}</div>}
                                </Card.Body>
                              </Card>
                              ))
                            }
                          </>
                          ) : <p className="text-muted text-center p-4">No vouchers for this status.</p>
                      )}
                </div>
                
                <div className="mt-4 d-flex justify-content-center">
                    <Pagination paginationData={userVouchers.pagination} onPageChange={(url) => fetchUserVouchers(new URL(url).searchParams.get('page'))} />
                </div>
            </section>
        </div>


        
    </div>
    
  );
};

export default RewardsVouchersPage;