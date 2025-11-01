import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import VenueCard from '../../../components/specific/VenueCard';
import TournamentCard from '../../../components/specific/TournamentCard';
import { getFeaturedVenues, getUpcomingTournaments } from '../../../api/homeApi';

const VenuesAndTournaments = () => {
  const [venues, setVenues] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchData = async () => {
          try {
              // Fetch both sets of data in parallel
              const [venuesRes, tournamentsRes] = await Promise.allSettled([
                getFeaturedVenues(),
                getUpcomingTournaments()
              ]);

              setVenues(venuesRes.value);
              setTournaments(tournamentsRes.value);
          } catch (error) {
              console.error("Failed to fetch homepage data:", error);
          } finally {
              setLoading(false);
          }
      };

      fetchData();
    }, []); // [] means only use the effect once

  // Loading state
  if (loading) {
      return (
          <div className="text-center my-5">
              <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
              </Spinner>
          </div>
      );
  }

  return (
        <div className="home-page-container">
            <Container>
                {/* Featured Venues Section */}
                <section className="mb-5">
                    <h2 className="section-title">Featured Venues</h2>
                    {venues.length > 0 ? (
                    <Row xs={1} md={2} lg={4} className="g-4">
                        {(venues || []).map(venue => (
                            <Col key={venue.id}>
                                <VenueCard venue={venue} />
                            </Col>
                            // <VenueCard key={venue.id} venue={venue} />
                        ))}
                    </Row>
                    ) : (
                        <div className="text-center pt-3">
                            <p className="text-muted">There are currently no featured venues to display.</p>
                        </div>
                    )}
                </section>

                {/* Upcoming Tournaments Section */}
                <section>
                    <h2 className="section-title">Upcoming Tournaments</h2>
                    {tournaments.length > 0 ? (
                    <Row>
                         {(tournaments || []).map(tournament => (
                            <TournamentCard key={tournament.id} tournament={tournament} />
                        ))}
                    </Row>
                    ) : (
                        <div className="text-center pt-3">
                            <p className="text-muted">There are currently no upcoming tournaments to display.</p>
                        </div>
                    )}
                </section>
            </Container>
        </div>
    );
};

export default VenuesAndTournaments;