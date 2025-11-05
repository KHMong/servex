import React from 'react';
import { Link } from 'react-router-dom';
import { IoIosArrowBack } from "react-icons/io";
import './BackButton.css';

const BackButton = ({
  to,
  icon,
  type = 'button',
  ...rest
}) => {
  // Combine all the classes together
  const classes = 'back-btn text-decoration-none d-inline-block mb-4';

  // Link button
  return (
      <Link to={to} className={classes} {...rest}>
        <IoIosArrowBack/> Back to {rest.place}
      </Link>
    );
};

export default BackButton;