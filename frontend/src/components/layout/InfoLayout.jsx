import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import InfoSidebar from './InfoSidebar';

const InfoLayout = () => {
  return (
    <Container className="py-5">
      <Row className="gap-3">
        <Col lg={3}>
          <InfoSidebar />
        </Col>
        <Col lg={8}>
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
};

export default InfoLayout;