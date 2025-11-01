import React from 'react';
import { Pagination as BootstrapPagination } from 'react-bootstrap';

// Import CSS file
import './Pagination.css';

const Pagination = ({ paginationData, onPageChange }) => {
  // Don't render if there's only one page or no data
  if (!paginationData || paginationData.last_page <= 1) {
    return null; 
  }

  const { links, current_page, last_page } = paginationData;

  return (
    <BootstrapPagination className="justify-content-center">
      {links.map((link, index) => {
        // If no URL provided, disable the link
        if (!link.url) {
          return <BootstrapPagination.Ellipsis key={index} disabled />;
        }
        
        // Previous & Next labels
        let label = link.label
          .replace(/&laquo;/g, '')
          .replace(/&raquo;/g, '')
          .trim();

        const isPrevNext = label.toLowerCase() === 'previous' || label.toLowerCase() === 'next';  

        return (
          <BootstrapPagination.Item
            key={index}
            active={link.active}
            onClick={() => !link.active && onPageChange(link.url)}
            className={isPrevNext ? 'prev-next-item' : ''} 
          >
            {label}
          </BootstrapPagination.Item>
        );
      })}
    </BootstrapPagination>
  );
};

export default Pagination;