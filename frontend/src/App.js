import React from 'react';
import { Outlet } from 'react-router-dom';
import NavbarComponent from './components/layout/Navbar';
import Footer from './components/layout/Footer';

function App() {
  return (
    <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
      <NavbarComponent />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default App;
