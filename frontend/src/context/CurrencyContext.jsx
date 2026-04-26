/**
 * CurrencyContext — Multi-currency support with live exchange rates.
 * Prices are stored as USD in the DB; this converts on display.
 */
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const CURRENCIES = {
    USD: { code: 'USD', symbol: '$',   name: 'US Dollar',         locale: 'en-US',   flag: '🇺🇸' },
    LKR: { code: 'LKR', symbol: 'Rs.', name: 'Sri Lankan Rupee',  locale: 'si-LK',   flag: '🇱🇰' },
    EUR: { code: 'EUR', symbol: '€',   name: 'Euro',              locale: 'de-DE',   flag: '🇪🇺' },
    GBP: { code: 'GBP', symbol: '£',   name: 'British Pound',     locale: 'en-GB',   flag: '🇬🇧' },
    INR: { code: 'INR', symbol: '₹',   name: 'Indian Rupee',      locale: 'en-IN',   flag: '🇮🇳' },
    AUD: { code: 'AUD', symbol: 'A$',  name: 'Australian Dollar',  locale: 'en-AU',   flag: '🇦🇺' },
    JPY: { code: 'JPY', symbol: '¥',   name: 'Japanese Yen',       locale: 'ja-JP',   flag: '🇯🇵' },
    SGD: { code: 'SGD', symbol: 'S$',  name: 'Singapore Dollar',   locale: 'en-SG',   flag: '🇸🇬' },
    AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham',         locale: 'ar-AE',   flag: '🇦🇪' },
    THB: { code: 'THB', symbol: '฿',   name: 'Thai Baht',          locale: 'th-TH',   flag: '🇹🇭' },
};

const STORAGE_KEY = 'gembid_currency';
const RATES_CACHE_KEY = 'gembid_rates';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

const CurrencyContext = createContext(null);

export const SUPPORTED_CURRENCIES = CURRENCIES;

export function CurrencyProvider({ children }) {
    const [currency, setCurrencyState] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved && CURRENCIES[saved] ? saved : 'USD';
        } catch {
            return 'USD';
        }
    });

    const [rates, setRates] = useState(() => {
        try {
            const cached = JSON.parse(localStorage.getItem(RATES_CACHE_KEY));
            if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.rates;
        } catch { /* ignore */ }
        return { USD: 1 };
    });

    const [ratesLoading, setRatesLoading] = useState(false);
    const fetchedRef = useRef(false);

    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;

        // Check cache freshness
        try {
            const cached = JSON.parse(localStorage.getItem(RATES_CACHE_KEY));
            if (cached && Date.now() - cached.ts < CACHE_TTL) {
                setRates(cached.rates);
                return;
            }
        } catch { /* ignore */ }

        setRatesLoading(true);
        fetch('https://open.er-api.com/v6/latest/USD')
            .then(r => r.json())
            .then(data => {
                if (data?.rates) {
                    const filtered = {};
                    for (const code of Object.keys(CURRENCIES)) {
                        filtered[code] = data.rates[code] || 1;
                    }
                    setRates(filtered);
                    localStorage.setItem(RATES_CACHE_KEY, JSON.stringify({ rates: filtered, ts: Date.now() }));
                }
            })
            .catch(() => { /* fallback: keep existing rates */ })
            .finally(() => setRatesLoading(false));
    }, []);

    const setCurrency = useCallback((code) => {
        if (CURRENCIES[code]) {
            setCurrencyState(code);
            localStorage.setItem(STORAGE_KEY, code);
        }
    }, []);

    const convert = useCallback((usdAmount) => {
        const num = parseFloat(usdAmount);
        if (isNaN(num)) return 0;
        if (currency === 'USD') return num;
        return num * (rates[currency] || 1);
    }, [currency, rates]);

    const formatPrice = useCallback((usdAmount, opts = {}) => {
        const num = parseFloat(usdAmount);
        if (isNaN(num)) return '—';
        const converted = convert(num);
        const info = CURRENCIES[currency];

        const { compact = false, showCode = false } = opts;

        // Use Intl formatter for proper locale formatting
        const formatted = new Intl.NumberFormat(info.locale, {
            style: 'currency',
            currency: info.code,
            minimumFractionDigits: info.code === 'JPY' ? 0 : 2,
            maximumFractionDigits: info.code === 'JPY' ? 0 : 2,
            ...(compact && converted >= 1000 ? { notation: 'compact' } : {}),
        }).format(converted);

        return showCode ? `${formatted} ${info.code}` : formatted;
    }, [currency, convert]);

    const value = {
        currency,
        setCurrency,
        currencyInfo: CURRENCIES[currency],
        currencies: CURRENCIES,
        rates,
        ratesLoading,
        convert,
        formatPrice,
    };

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const ctx = useContext(CurrencyContext);
    if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
    return ctx;
}

export default CurrencyContext;
