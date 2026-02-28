import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './shared/components/LandingPage';
import Signup from './features/users/pages/Signup';
import Login from './features/users/pages/Login';
import SellerDashboard from './features/users/pages/SellerDashboard';
import BuyerDashboard from './features/users/pages/BuyerDashboard';
import Profile from './features/users/pages/Profile';
import GemDetails from './features/gems/pages/GemDetails';
import AdminDashboard from './features/users/pages/AdminDashboard';

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
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;
