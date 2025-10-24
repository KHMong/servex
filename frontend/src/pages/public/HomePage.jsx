import React from 'react';
import HeroSection from './home/HeroSection';
import FeaturesSection from './home/FeaturesSection';
import VenuesAndTournaments from './home/VenuesAndTournaments';

// Import CSS
import './HomePage.css';

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <VenuesAndTournaments />
    </>
  );
};

export default HomePage;