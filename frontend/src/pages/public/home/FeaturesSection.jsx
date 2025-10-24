import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

// Import icons
import { TbChecklist } from 'react-icons/tb';
import { IoTrophyOutline, IoPeopleOutline } from 'react-icons/io5';

// Import CSS
import './FeaturesSection.css';

// Data
const featuresData = [
  {
    icon: <TbChecklist className="feature-icon" />,
    title: "Real-Time Court Booking",
    description: "Instantly find and book available courts at your favorite venues."
  },
  {
    icon: <IoTrophyOutline className="feature-icon" />,
    title: "Join Exciting Tournaments",
    description: "Discover and register for local tournaments for all skill levels."
  },
  {
    icon: <IoPeopleOutline className="feature-icon" />,
    title: "Connect with Players",
    description: "Create or join social activities and find new partners to play with."
  }
];

const FeaturesSection = () => {
  return (
    <div className="features-section my-5">
      <Container>
        <Row className="gy-5">
          {featuresData.map((feature, index) => (
            <Col key={index} md={4}>
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  {feature.icon}
                </div>
                <h4 className="feature-title">{feature.title}</h4>
                <p className="feature-description">{feature.description}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default FeaturesSection;