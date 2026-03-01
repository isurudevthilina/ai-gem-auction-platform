import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './pages/LandingPage';
import Signup from './pages/Signup';
import Login from './pages/Login';
import SellerDashboard from './pages/SellerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import Profile from './pages/Profile';
import GemDetails from './pages/GemDetails';
import AdminDashboard from './pages/AdminDashboard';
import Watchlist from './pages/Watchlist';

function App() {
    return (
        <ThemeProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/seller-dashboard" element={<SellerDashboard />} />
                    <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/gem/:id" element={<GemDetails />} />
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                    <Route path="/watchlist" element={<Watchlist />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;
