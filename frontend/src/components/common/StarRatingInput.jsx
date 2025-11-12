import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import './StarRatingInput.css';

const StarRatingInput = ({ rating, onRatingChange }) => {
  const [hover, setHover] = useState(null);

  return (
    <div className="star-rating-input">
      {[...Array(5)].map((_, index) => {
        const currentRating = index + 1;
        return (
          <label key={index}>
            <input
              type="radio"
              name="rating"
              value={currentRating}
              onClick={() => onRatingChange(currentRating)}
              style={{ display: 'none' }}
            />
            <FaStar
              className="star"
              size={30}
              color={currentRating <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
              onMouseEnter={() => setHover(currentRating)}
              onMouseLeave={() => setHover(null)}
            />
          </label>
        );
      })}
    </div>
  );
};

export default StarRatingInput;