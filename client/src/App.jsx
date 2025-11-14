import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import UploadPage from './pages/UploadPage';
import ReviewPage from './pages/ReviewPage';
import WardrobePage from './pages/WardrobePage';
import OutfitsPage from './pages/OutfitsPage';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />

            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <UploadPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/review"
              element={
                <ProtectedRoute>
                  <ReviewPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/wardrobe"
              element={
                <ProtectedRoute>
                  <WardrobePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/outfits"
              element={
                <ProtectedRoute>
                  <OutfitsPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
