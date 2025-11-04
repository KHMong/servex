import React from 'react';
import StarRating from '../common/StarRating';
import { getImageUrl } from '../../utils/imageUrl';

import './ReviewCard.css';

// Receives review data and displays it.
const ReviewCard = ({ review }) => {
  if (!review || !review.user) {
    return null; 
  }

  const { rating, comment, posted_date, user } = review;

  const userName = user.name || 'Anonymous';
  const userPhoto = getImageUrl(user.photo_path);

  return (
    <div className="review-card">
      <div className="d-flex">
        {/* Avatar */}
        <img 
          src={userPhoto} 
          alt={userName} 
          className="review-avatar me-3 border" 
        />

        {/* Content */}
        <div className="flex-grow-1">
          <div className="review-header">
            <div>
              <h6 className="review-author mb-1">{userName}</h6>
              <StarRating rating={rating} />
            </div>

            {/* Date */}
            {posted_date && (
              <p className="review-date mb-0">{posted_date}</p>
            )}
          </div>

          <p className="review-comment mb-0">{comment}</p>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;