import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle } from 'lucide-react';
import GemScene from './GemScene'; // Assumes the provided 3D gem component is here
import './GemCard.css';

const GemCard = ({ gem }) => {
    const {
        id,
        name,
        carat,
        timeLeft,
        currentBid,
        buyNow,
        gemType = 'sapphire', // passed to 3D scene 
        isVerified = true
    } = gem;

    return (
        <Link to={`/gem/${id}`} className="gem-card-link">
            <div className="gem-card">

                {/* ── Top Badges Row ── */}
                <div className="card-badges">
                    {isVerified && (
                        <div className="badge badge-verified">
                            <CheckCircle size={12} strokeWidth={3} /> Verified
                        </div>
                    )}
                    <div className="badge badge-timer">
                        <Clock size={12} strokeWidth={2.5} /> {timeLeft}
                    </div>
                </div>

                {/* ── 3D Gem Visual Area ── */}
                <div className="card-visual">
                    <div className="gem-scene-wrapper">
                        {/* We use the provided React Three Fiber component here */}
                        <GemScene gemType={gemType} />
                    </div>
                </div>

                {/* ── Card Content ── */}
                <div className="card-content">
                    <div className="card-header">
                        <h3 className="gem-name">{name}</h3>
                        <span className="gem-carat">{carat} ct</span>
                    </div>

                    <div className="bid-info">
                        <div className="price-block">
                            <span className="price-label">CURRENT BID</span>
                            <span className="price-value text-gold">
                                ${currentBid?.toLocaleString() || '0'}
                            </span>
                        </div>
                        <div className="price-block">
                            <span className="price-label">BUY NOW</span>
                            <span className="price-value text-white">
                                ${buyNow?.toLocaleString() || '0'}
                            </span>
                        </div>
                    </div>

                    <button className="view-bids-btn" onClick={(e) => {
                        // Prevent navigation if they just wanted to click the button
                        // e.preventDefault();
                    }}>
                        View Bids
                    </button>
                </div>
            </div>
        </Link>
    );
};

export default GemCard;
