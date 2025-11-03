import React from 'react';
import { FaStar } from 'react-icons/fa';

const VenueHeader = ({ venue }) => (
  <section>
    <h1 className="display-5 fw-bold">{venue.name}</h1>
    <p className="text-muted">{venue.address}</p>
    <div className="d-flex align-items-center">
      <FaStar className="text-warning me-1" />
      <span className="fw-bold me-1">{parseFloat(venue.average_rating).toFixed(1)}</span>
      <span className="text-muted">({venue.reviews_count} reviews)</span>
    </div>
  </section>
);

export default VenueHeader;