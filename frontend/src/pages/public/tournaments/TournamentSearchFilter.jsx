import React from 'react';
import { Form, Row, Col, InputGroup } from 'react-bootstrap';
import Button from '../../../components/common/Button';
import { FaSearch } from 'react-icons/fa';

// Import CSS file
import './TournamentSearchFilter.css';

const TournamentSearchFilter = ({ states, filters, onFilterChange, onSearch }) => {
  return (
    <Form onSubmit={onSearch}>
      <Row className="justify-content-center">
        <Col md={10} lg={12}>
          <div className="search-filter-wrapper flex-md-row">
            
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

            {/* Date Input */}
            <Form.Control
              type="date"
              name="date"
              value={filters.date}
              onChange={onFilterChange}
              className="search-select"
            />

            {/* Search Input */}
            <InputGroup className="flex-grow-1">
              <Form.Control
                type="text"
                name="search"
                placeholder="Search by tournament name..."
                value={filters.search}
                onChange={onFilterChange}
                className="search-input"
              />
            </InputGroup>
            

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

export default TournamentSearchFilter;