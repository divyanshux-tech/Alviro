import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Contact from './pages/Contact';
import AIDashboard from './pages/Admin/AIDashboard';
import Login from './pages/Admin/Login';
import MenuManager from './pages/Admin/MenuManager';

import ProtectedRoute from './components/ProtectedRoute';

import DesignOverlay from './components/DesignOverlay';
import Chatbot from './components/Chatbot';
import ScrollToTop from './components/ScrollToTop';

export default App;

function App() {
  return (
    <CartProvider>
      <ThemeProvider>
        <Router>
        <ScrollToTop />
        <DesignOverlay />
        <Chatbot />
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* Admin Protected Routes */}
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin/dashboard" element={<ProtectedRoute><AIDashboard /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AIDashboard /></ProtectedRoute>} />
              <Route path="/admin/menu" element={<ProtectedRoute><MenuManager /></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
    </CartProvider>
  );
}


