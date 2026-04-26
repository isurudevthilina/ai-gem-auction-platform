import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import ProtectedRoute from './shared/components/ProtectedRoute';
import PublicLayout from './shared/components/PublicLayout';
import ErrorBoundary from './shared/components/ErrorBoundary';
import Unauthorized from './shared/components/Unauthorized';
import ScrollLandingPage from './shared/components/ScrollLandingPage';
import Signup from './features/users/pages/Signup';
import Login from './features/users/pages/Login';
import SellerDashboard from './features/users/pages/SellerDashboard';
import BuyerOverviewPage from './features/users/pages/BuyerOverviewPage';
import Profile from './features/users/pages/Profile';
import GemDetails from './features/gems/pages/GemDetails';
import AdminDashboard from './features/users/pages/AdminDashboard';
import AuctionListPage from './features/auctions/pages/AuctionListPage';
import LiveAuctionPage from './features/auctions/pages/LiveAuctionPage';
import CreateAuctionPage from './features/auctions/pages/CreateAuctionPage';
import AIPredictorPage from './features/AI/pages/AIPredictor';
import GemListPage from './features/gems/pages/GemListPage';
import CreateGemPage from './features/gems/pages/CreateGemPage';
import EditGemPage from './features/gems/pages/EditGemPage';
import WatchlistPage from './features/watchlist/pages/WatchlistPage';
import BidHistoryPage from './features/auctions/pages/BidHistoryPage';
import PurchaseRequestsPage from './features/transactions/pages/PurchaseRequestsPage';
import ReceiptPage from './features/transactions/pages/ReceiptPage';
import WriteReviewPage from './features/reviews/pages/WriteReviewPage';
import SellerReviewsPage from './features/reviews/pages/SellerReviewsPage';
import AdminReviewModerationPage from './features/reviews/pages/AdminReviewModerationPage';
import TopUpPage from './features/wallet/pages/TopUpPage';
import GemStorePage from './features/wallet/pages/GemStorePage';
import WithdrawPage from './features/wallet/pages/WithdrawPage';
import SellerPublicProfile from './features/users/pages/SellerPublicProfile';
import CertificateReviewPanel from './features/certificates/pages/CertificateReviewPanel';
import UserManagement from './features/users/pages/UserManagement';
import NotificationsPage from './features/notifications/pages/NotificationsPage';
import NotFoundPage from './shared/pages/NotFoundPage';
import TermsPage from './shared/pages/TermsPage';
import PrivacyPage from './shared/pages/PrivacyPage';
import DisclaimerPage from './shared/pages/DisclaimerPage';
import ToastContainer from './shared/components/ToastContainer';
import RoleDashboardRedirect from './shared/components/RoleDashboardRedirect';
import { useRealtimeNotifications } from './features/notifications/hooks/useNotifications';
import { useAuth } from './context/AuthContext';

const queryClient = new QueryClient();

function RealtimeManager() {
    const { user } = useAuth();
    useRealtimeNotifications(user?.id);
    return null;
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
        <ThemeProvider>
            <AuthProvider>
            <CurrencyProvider>
                <RealtimeManager />
                <ErrorBoundary>
                <Router>
                    <Routes>
                        {/* ── Landing page (embeds shared Navbar + Footer internally for z-index control) ── */}
                        <Route path="/"       element={<ScrollLandingPage />} />
                        <Route path="/signup"  element={<Signup />} />
                        <Route path="/login"   element={<Login />} />

                        {/* ── Public pages with Navbar + Footer ── */}
                        <Route path="/auctions" element={
                            <PublicLayout><AuctionListPage /></PublicLayout>
                        } />
                        <Route path="/auctions/new" element={
                            <ProtectedRoute roles={['seller', 'admin']}>
                                <PublicLayout><CreateAuctionPage /></PublicLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/auctions/:id" element={
                            <PublicLayout><LiveAuctionPage /></PublicLayout>
                        } />
                        <Route path="/gems" element={
                            <PublicLayout><GemListPage /></PublicLayout>
                        } />
                        <Route path="/gem/:id" element={
                            <PublicLayout><GemDetails /></PublicLayout>
                        } />
                        <Route path="/ai-predictor" element={
                            <PublicLayout><AIPredictorPage /></PublicLayout>
                        } />
                        <Route path="/unauthorized" element={
                            <PublicLayout><Unauthorized /></PublicLayout>
                        } />

                        {/* ── Protected with Navbar + Footer ── */}
                        <Route path="/profile" element={
                            <ProtectedRoute>
                                <PublicLayout><Profile /></PublicLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/watchlist" element={
                            <ProtectedRoute>
                                <PublicLayout><WatchlistPage /></PublicLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/bid-history" element={
                            <ProtectedRoute>
                                <PublicLayout><BidHistoryPage /></PublicLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/transactions" element={
                            <ProtectedRoute>
                                <PublicLayout><PurchaseRequestsPage /></PublicLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/transactions/:id" element={
                            <ProtectedRoute>
                                <PublicLayout><ReceiptPage /></PublicLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/wallet/top-up" element={
                            <ProtectedRoute>
                                <PublicLayout><TopUpPage /></PublicLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/wallet/gem-store" element={
                            <ProtectedRoute>
                                <PublicLayout><GemStorePage /></PublicLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/wallet/withdraw" element={
                            <ProtectedRoute>
                                <PublicLayout><WithdrawPage /></PublicLayout>
                            </ProtectedRoute>
                        } />

                        {/* ── Reviews ── */}
                        <Route path="/sellers/:sellerId/reviews" element={
                            <PublicLayout><SellerReviewsPage /></PublicLayout>
                        } />
                        <Route path="/reviews/new" element={
                            <ProtectedRoute>
                                <PublicLayout><WriteReviewPage /></PublicLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/reviews/:reviewId/edit" element={
                            <ProtectedRoute>
                                <PublicLayout><WriteReviewPage /></PublicLayout>
                            </ProtectedRoute>
                        } />

                        <Route path="/notifications" element={
                            <ProtectedRoute>
                                <PublicLayout><NotificationsPage /></PublicLayout>
                            </ProtectedRoute>
                        } />

                        {/* ── Protected — seller/admin gem creation & editing ── */}
                        <Route path="/gems/new" element={
                            <ProtectedRoute roles={['seller', 'admin']}>
                                <PublicLayout><CreateGemPage /></PublicLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/gems/:id/edit" element={
                            <ProtectedRoute roles={['seller', 'admin']}>
                                <PublicLayout><EditGemPage /></PublicLayout>
                            </ProtectedRoute>
                        } />

                        {/* ── Dashboard pages (with Navbar & Footer) ── */}
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <PublicLayout><RoleDashboardRedirect /></PublicLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/overview" element={
                            <ProtectedRoute roles={['buyer']}>
                                <PublicLayout><BuyerOverviewPage /></PublicLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/seller-dashboard" element={
                            <ProtectedRoute roles={['seller']}>
                                <PublicLayout><SellerDashboard /></PublicLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/admin-dashboard/certs" element={
                            <ProtectedRoute roles={['admin']}>
                                <PublicLayout><CertificateReviewPanel /></PublicLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/admin-dashboard/users" element={
                            <ProtectedRoute roles={['admin']}>
                                <PublicLayout><UserManagement /></PublicLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/admin-dashboard/reviews" element={
                            <ProtectedRoute roles={['admin']}>
                                <PublicLayout><AdminReviewModerationPage /></PublicLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/admin-dashboard" element={
                            <ProtectedRoute roles={['admin']}>
                                <PublicLayout><AdminDashboard /></PublicLayout>
                            </ProtectedRoute>
                        } />

                        {/* ── Seller public profile ── */}
                        <Route path="/sellers/:sellerId" element={
                            <PublicLayout><SellerPublicProfile /></PublicLayout>
                        } />

                        {/* ── Static pages ── */}
                        <Route path="/terms" element={
                            <PublicLayout><TermsPage /></PublicLayout>
                        } />
                        <Route path="/privacy" element={
                            <PublicLayout><PrivacyPage /></PublicLayout>
                        } />
                        <Route path="/disclaimer" element={
                            <PublicLayout><DisclaimerPage /></PublicLayout>
                        } />

                        {/* ── 404 catch-all (must be last) ── */}
                        <Route path="*" element={
                            <PublicLayout><NotFoundPage /></PublicLayout>
                        } />
                    </Routes>
                </Router>
                </ErrorBoundary>
            </CurrencyProvider>
            </AuthProvider>
            <ToastContainer />
        </ThemeProvider>
        </QueryClientProvider>
    );
}

export default App;
