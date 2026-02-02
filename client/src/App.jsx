import React from 'react';
import AuthPage from './pages/AuthPage';
import TicketList from './pages/Ticket';
import TicketDetail from './components/TicketDetails';
import TicketForm from './components/TicketForm';
import AssetList from './pages/AssetList';
import AssetDetail from './components/AssetDetail';
import AssetForm from './components/AssetForm';
import TicketDashboard from './pages/TicketDashboar';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  // Check if token exists in storage
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        {/* If logged in, "/" takes you to tickets. If not, to auth */}
        <Route path="/" element={<Navigate to={isAuthenticated ? "/tickets" : "/auth"} />} />

        {/* If logged in, prevent access to login page by redirecting to tickets */}
        <Route 
          path="/auth" 
          element={isAuthenticated ? <Navigate to="/tickets" /> : <AuthPage />} 
        />

        {/* If not logged in, prevent access to tickets by redirecting to auth */}
        <Route 
          path="/tickets" 
          element={isAuthenticated ? <TicketList /> : <Navigate to="/auth" />} 
        />

        <Route path="/tickets/:id" element={<TicketDetail />} />

        <Route path="/tickets/new" element={<TicketForm />} />
        <Route path="/tickets/edit/:id" element={<TicketForm />} />

        <Route path="/assets" element={<AssetList />} />
        <Route path="/assets/new" element={<AssetForm />} />
        <Route path="/assets/:id" element={<AssetDetail />} />
        <Route path="/assets/edit/:id" element={<AssetForm />} />

        <Route path="/dashboard" element={<TicketDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;