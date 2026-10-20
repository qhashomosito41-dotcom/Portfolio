import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { BackToTop } from '../components/BackToTop';
import { PublicDataProvider } from '../contexts/PublicDataContext';

const ScrollManager = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = decodeURIComponent(location.hash.slice(1));
      const timer = window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 40);
      return () => window.clearTimeout(timer);
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    return undefined;
  }, [location.pathname, location.hash]);

  return null;
};

export const PublicLayout = () => (
  <PublicDataProvider>
    <ScrollManager />
    <a href="#main-content" className="skip-link">
      Skip to content
    </a>
    <Navbar />
    <main id="main-content">
      <Outlet />
    </main>
    <Footer />
    <BackToTop />
  </PublicDataProvider>
);
