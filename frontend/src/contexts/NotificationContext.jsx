import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null); // Hold { message, type }
  let timeoutId = null;

  // Ensures that it won't get recreated for every render
  const showNotification = useCallback((message, type = 'success') => {
    // If a notification is showing, clear the hide timer
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    setNotification({ message, type });
  }, []);

  const hideNotification = () => {
    setNotification(null);
  };

  // Run whenever notification state changes
  useEffect(() => {
    if (notification) {
      // Hide the notification after 5 seconds
      timeoutId = setTimeout(() => {
        hideNotification();
      }, 5000);
    }
    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [notification]); // Run only when notification changes

  return (
    <NotificationContext.Provider value={{ notification, showNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};