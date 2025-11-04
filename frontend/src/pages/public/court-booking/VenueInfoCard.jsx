import React from 'react';

const formatPrice = (price) => {
  if (price === null || price === undefined) {
    return 'Not Available';
  }
  
  // Convert to two decimal places
  const numericPrice = parseFloat(price).toFixed(2);
  return `RM ${numericPrice} / hour`;
};

const VenueInfoCard = ({ venue }) => {
  // Find rules
  const weekdayRule = venue.pricing_rules?.find(
    rule => rule.day_type === 'Weekday'
  );

  const weekendRule = venue.pricing_rules?.find(
    rule => rule.day_type === 'Weekend'
  );

  // Prices
  const weekdayPrice = weekdayRule ? weekdayRule.price : null;
  const weekendPrice = weekendRule ? weekendRule.price : null;

  // Times
  const formattedOpeningTime = venue.opening_time?.substring(0, 5) || 'N/A';
  const formattedClosingTime = venue.closing_time?.substring(0, 5) || 'N/A';

  return (
    <div className="border rounded shadow-sm bg-white p-4 position-sticky">
      <h5 className="mb-4 fw-bold">Venue Information</h5>

      <div className="d-flex gap-2 mb-2">
        <span className="fw-semibold">Operating Hours:</span>
        <span className="text-muted fw-medium">{formattedOpeningTime} - {formattedClosingTime}</span>
      </div>

      <div className="d-flex gap-2 mb-3">
        <span className="fw-semibold">Contact:</span>
        <span className="text-muted fw-medium">{venue.phone_no}</span>
      </div>

      <hr/>

      <div className="d-flex gap-2 mb-2">
        <span className="fw-semibold">Weekday Price:</span>
        <span className="text-muted fw-medium">{formatPrice(weekdayPrice)}</span>
      </div>

      <div className="d-flex gap-2">
        <span className="fw-semibold">Weekend Price:</span>
        <span className="text-muted fw-medium">{formatPrice(weekendPrice)}</span>
      </div>
    </div>
  );
};

export default VenueInfoCard;