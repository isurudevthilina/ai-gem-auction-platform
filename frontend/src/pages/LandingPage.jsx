import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import AboutUs from '../components/AboutUs';
import AIPredictor from '../components/AIPredictor';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

const LandingPage = () => {
    const { isDark } = useTheme();

    return (
        <div
            data-theme={isDark ? 'dark' : 'light'}
            style={{
                minHeight: '100vh',
                background: isDark ? '#09090f' : '#ffffff',
                position: 'relative',
                transition: 'background 0.35s ease',
            }}
        >
            {/* ── Animated aurora background (dark only) ── */}
            {isDark && (
                <div className="site-bg">
                    <div className="orb-1" />
                    <div className="orb-2" />
                    <div className="orb-3" />
                    <div className="orb-4" />
                </div>
            )}

            {/* ── Page content ── */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                <Navbar />
                <main>
                    <Hero />
                    <Features />
                    <AboutUs />
                    <AIPredictor />
                    <FAQ />
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default LandingPage;
