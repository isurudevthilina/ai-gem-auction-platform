import Navbar from './Navbar';
import Footer from './Footer';

export default function PublicLayout({ children }) {
    return (
        <>
            <Navbar />
            <main style={{ paddingTop: 88 }}>
                {children}
            </main>
            <Footer />
        </>
    );
}
