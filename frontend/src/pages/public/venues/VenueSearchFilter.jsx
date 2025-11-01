import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import Button from '../../../components/common/Button';
import { FaSearch } from 'react-icons/fa';

// Import CSS file
import './VenueSearchFilter.css';

const VenueSearchFilter = ({ states, filters, onFilterChange, onSearch }) => {
  return (
    <Form onSubmit={onSearch}>
      <Row className="justify-content-center">
        <Col md={9} lg={10}>
          <div className="search-filter-wrapper">
            
            {/* State Dropdown */}
            <Form.Select 
              name="state_id" 
              value={filters.state_id} 
              onChange={onFilterChange}
              className="search-select"
            >
              <option value="">All States</option>
              {states.map(state => (
                <option key={state.id} value={state.id}>{state.name}</option>
              ))}
            </Form.Select>

            {/* Search Input */}
            <Form.Control
              type="text"
              name="search"
              placeholder="Search by venue name..."
              value={filters.search}
              onChange={onFilterChange}
              className="search-input"
            />

            {/* Search Button */}
            <Button 
              type="submit" 
              icon={<FaSearch />} 
              className="search-action-button"
            >
              Search
            </Button>
            
          </div>
        </Col>
      </Row>
    </Form>
  );
};

export default VenueSearchFilter;