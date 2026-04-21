import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { CustomerProfilePage } from './pages/CustomerProfilePage';
import { DeliveriesPage } from './pages/DeliveriesPage';
import { ReportsPage } from './pages/ReportsPage';
import './index.css'

const INTRO_FLAG = 'digital-milk-book-intro-seen';

const IntroSplash = ({ onFinish }) => {
  return (
    <div className="intro-overlay">
      <div className="intro-shell glass-panel-strong animate-fade-up">
        <div className="intro-badge brand-mark">🥛</div>
        <div className="intro-vendor-scene">
          <div className="intro-vendor-track" />
          <div className="intro-vendor animate-float">
            <div className="intro-cart">
              <div className="intro-cart-body" />
              <div className="intro-wheel intro-wheel-left" />
              <div className="intro-wheel intro-wheel-right" />
              <div className="intro-can intro-can-back" />
              <div className="intro-can intro-can-front" />
              <div className="intro-milk" />
            </div>
            <div className="intro-vendor-figure">
              <div className="intro-vendor-cap" />
              <div className="intro-vendor-head" />
              <div className="intro-vendor-torso" />
              <div className="intro-vendor-arm intro-vendor-arm-left" />
              <div className="intro-vendor-arm intro-vendor-arm-right" />
            </div>
          </div>
        </div>
        <div className="mt-7 text-center">
          <p className="section-label mb-3">Digital Milk Book</p>
          <h1 className="page-title text-3xl sm:text-4xl">Fresh dairy operations, delivered daily.</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--text-muted)]">
            Tracking customers, deliveries, and monthly billing with a clean milk vendor flow.
          </p>
        </div>
        <div className="loading-pips mt-6" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
      <button type="button" className="sr-only" onClick={onFinish}>
        Continue
      </button>
    </div>
  );
};

function App() {
  const [appReady, setAppReady] = useState(false);
  const introDuration = 2800;

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem(INTRO_FLAG);

    if (!hasSeenIntro) {
      const timer = window.setTimeout(() => {
        sessionStorage.setItem(INTRO_FLAG, '1');
        setAppReady(true);
      }, introDuration);

      return () => window.clearTimeout(timer);
    }

    setAppReady(true);
    return undefined;
  }, []);

  if (!appReady) {
    return <IntroSplash onFinish={() => {
      sessionStorage.setItem(INTRO_FLAG, '1');
      setAppReady(true);
    }} />;
  }

  return (
    <>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <ProtectedRoute>
                  <CustomersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers/:id"
              element={
                <ProtectedRoute>
                  <CustomerProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/deliveries"
              element={
                <ProtectedRoute>
                  <DeliveriesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster position="top-right" />
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
