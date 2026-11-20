import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import * as transport from '@transport';
import './styles.css';
import { useAuth } from './store/auth.js';
import AppShell from './components/AppShell.jsx';
import { Toasts, Celebration } from './components/common.jsx';
import { Landing, Login, Signup, Onboarding, ForgotPassword, Verify, Legal, NotFound } from './pages/Public.jsx';
import Settings from './pages/Settings.jsx';
import { AmbassadorHome, ToolPage, Drafts } from './pages/Ambassador.jsx';
import Showcase from './pages/Showcase.jsx';
import Lab from './pages/Lab.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { Library, LessonView } from './pages/Learn.jsx';
import Interviews from './pages/Interviews.jsx';
import { StudioHome, ChallengeView } from './pages/Studio.jsx';
import { CertificateList, CertificateView } from './pages/Certificates.jsx';
import Admin from './pages/Admin.jsx';
import Cards from './pages/Cards.jsx';
import Ideas from './pages/Ideas.jsx';

function AdminOnly({ children }) {
  const user = useAuth((s) => s.user);
  return user?.role === 'admin' ? children : <Navigate to="/app" replace />;
}

/* global __PREVIEW__ */
const Router = __PREVIEW__ ? MemoryRouter : BrowserRouter;

function PreviewBanner() {
  if (!__PREVIEW__) return null;
  return (
    <div className="preview-banner" role="note">
      <span><b>Preview</b> · sign-in, scoring and data are simulated in your browser. AI tools run in the full app.</span>
      <button type="button" className="btn btn-sm btn-ghost" onClick={() => { transport.resetPreview?.(); window.location.reload(); }}>Reset demo</button>
    </div>
  );
}

function App() {
  const bootstrap = useAuth((s) => s.bootstrap);
  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return (
    <Router>
      <PreviewBanner />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify/:code" element={<Verify />} />
        <Route path="/privacy" element={<Legal kind="privacy" />} />
        <Route path="/terms" element={<Legal kind="terms" />} />
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="learn" element={<Library />} />
          <Route path="learn/:id" element={<LessonView />} />
          <Route path="learn/:id/cards" element={<Cards />} />
          <Route path="ideas" element={<Ideas />} />
          <Route path="interviews" element={<Interviews />} />
          <Route path="studio" element={<StudioHome />} />
          <Route path="studio/:id" element={<ChallengeView />} />
          <Route path="certificates" element={<CertificateList />} />
          <Route path="certificates/:id" element={<CertificateView />} />
          <Route path="settings" element={<Settings />} />
          <Route path="showcase" element={<Showcase />} />
          <Route path="lab" element={<Lab />} />
          <Route path="ambassador" element={<AmbassadorHome />} />
          <Route path="ambassador/tools/:id" element={<ToolPage />} />
          <Route path="ambassador/drafts" element={<Drafts />} />
          <Route path="admin" element={<AdminOnly><Admin /></AdminOnly>} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toasts />
      <Celebration />
    </Router>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
