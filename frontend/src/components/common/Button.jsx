import React from 'react';
import { Link } from 'react-router-dom';
import './Button.css';

const Button = ({
  children,
  onClick,
  to,
  variant = 'primary',
  icon,
  type = 'button',
  disabled = false,
  className = '',
  ...rest
}) => {
  // Combine all the classes together
  const classes = `btn-custom btn-${variant} ${className}`;

  // Link button
  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {icon && <span className="btn-icon">{icon}</span>}
        {children}
      </Link>
    );
  }

  // Standard button
  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;