import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import './Notification.css';

const Notification = () => {
  const { notification } = useNotification();

  if (!notification) {
    return null;
  }

  const { message, type } = notification;

  const classes = `notification-wrapper ${type} show`;

  return (
    <div className={classes}>
      {message}
    </div>
  );
};

export default Notification;