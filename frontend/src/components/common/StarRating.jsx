import React from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';

const StarRating = ({ rating, totalStars = 5 }) => {
  const starElements = [];

  for (let i = 1; i <= totalStars; i++) {
    if (i <= rating) {
      // Render a filled star
      starElements.push(<FaStar key={i} className="text-warning" />);
    } else {
      // Render an empty star
      starElements.push(<FaRegStar key={i} className="text-warning" />);
    }
  }

  return <div className="d-inline-flex align-items-center gap-1">{starElements}</div>;
};

export default StarRating;