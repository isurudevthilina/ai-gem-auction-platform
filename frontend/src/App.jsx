import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import ScrollLandingPage from './shared/components/ScrollLandingPage';
import Signup from './features/users/pages/Signup';
import Login from './features/users/pages/Login';
import SellerDashboard from './features/users/pages/SellerDashboard';
import BuyerDashboard from './features/users/pages/BuyerDashboard';
import Profile from './features/users/pages/Profile';
import GemDetails from './features/gems/pages/GemDetails';
import AdminDashboard from './features/users/pages/AdminDashboard';
import AuctionListPage from './features/auctions/pages/AuctionListPage';
import LiveAuctionPage from './features/auctions/pages/LiveAuctionPage';
import AIPredictorPage from './features/gems/pages/AIPredictor';

function App() {
    return (
        <ThemeProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<ScrollLandingPage />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/seller-dashboard" element={<SellerDashboard />} />
                    <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/gem/:id" element={<GemDetails />} />
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                    {/* ── Auction routes ── */}
                    <Route path="/auctions" element={<AuctionListPage />} />
                    <Route path="/auctions/:id" element={<LiveAuctionPage />} />
                    {/* ── AI Predictor ── */}
                    <Route path="/ai-predictor" element={<AIPredictorPage />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;
