import React, { createContext, useState, useContext, useCallback, useEffect, useRef } from 'react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null); // Hold { message, type }
  const timeoutId = useRef(null); // Let it persist across all renders

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Ensures that it won't get recreated for every render
  const showNotification = useCallback((message, type = 'success') => {
    // Clear existing timer
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    
    // Set new notification
    setNotification({ message, type });

    // Hide the notification after 5 seconds
    timeoutId.current = setTimeout(() => {
      hideNotification();
    }, 5000); 
  }, [hideNotification]);

  useEffect(() => {
    // Cleanup function
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notification, showNotification, hideNotification }}>
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