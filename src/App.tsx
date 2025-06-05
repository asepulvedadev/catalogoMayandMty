import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';
import DashboardHome from './pages/DashboardHome';
import Customers from './pages/Customers';
import Quotes from './pages/Quotes';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import Footer from './components/Footer';
import { supabase } from './lib/supabase';
import './App.css';
import ProductList from './pages/ProductList';
import Layout from './components/Layout';
import ProductPage from './pages/ProductPage';

// Configuración de React Router
const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
};

function AppContent() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
        navigate('/admin');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="products" element={<Dashboard />} />
            <Route path="products/list" element={<ProductList />} />
            <Route path="customers" element={<Customers />} />
            <Route path="quotes" element={<Quotes />} />
            <Route path="sales" element={<Navigate to="/dashboard" />} />
            <Route path="reports" element={<Navigate to="/dashboard" />} />
          </Route>
          <Route path="/products" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router future={router.future}>
      <Layout>
        <AppContent />
      </Layout>
    </Router>
  );
}

export default App;