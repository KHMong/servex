import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import NavbarComponent from './components/layout/Navbar';
import Footer from './components/layout/Footer';

function App() {
  const location = useLocation();

  const needGrayBg = location.pathname.startsWith('/info');

  const mainClass = needGrayBg ? 'flex-grow-1 bg-light-gray' : 'flex-grow-1';

  return (
    <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
      <NavbarComponent />
      <main className={mainClass}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default App;
