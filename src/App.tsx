import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GuestProvider } from './context/GuestContext';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { PageBuilder } from './pages/PageBuilder';
import { PublishedPage } from './pages/PublishedPage';
import './styles/global.css';

export default function App() {
  return (
    <GuestProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<Dashboard />} />
          <Route path="/app/edit/:id" element={<PageBuilder />} />
          <Route path="/p/:slug" element={<PublishedPage />} />
        </Routes>
      </BrowserRouter>
    </GuestProvider>
  );
}
