import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Landing } from './pages/Landing';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { Dashboard } from './pages/Dashboard';
import { PageBuilder } from './pages/PageBuilder';
import { PublishedPage } from './pages/PublishedPage';
import './styles/global.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/app" element={<Dashboard />} />
          <Route path="/app/edit/:id" element={<PageBuilder />} />
          <Route path="/p/:slug" element={<PublishedPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
