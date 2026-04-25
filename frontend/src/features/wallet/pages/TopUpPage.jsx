import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMyWallet, useTopUpWallet } from '../hooks/useWallet';
import { SUPPORTED_CURRENCIES, useCurrency } from '../../../context/CurrencyContext';

const C = {
    bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
    goldLight: 'rgba(196,137,42,0.10)', green: '#16a34a', red: '#B91C1C',
    text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const SERIF = "'Cormorant Garamond','Georgia',serif";
const DISPLAY = "'Cinzel',serif";
const BODY = "'Jost','Inter',sans-serif";
const MIN_WALLET_ENTRY_USD = 300;
const MAX_TOP_UP_USD = 4000;

const schema = z.object({
    amount: z.coerce.number().positive('Enter a top-up amount'),
    currency_mode: z.enum(['auto', 'manual']),
    currency_code: z.enum(['USD', 'LKR', 'EUR', 'GBP', 'INR', 'AUD', 'JPY', 'SGD', 'AED', 'THB']),
    card_number: z.string().min(12, 'Enter a fake card number').max(19),
    expiry: z.string().min(4, 'Enter expiry date').max(7),
    cvv: z.string().min(3, 'Enter CVV').max(4),
    holder_name: z.string().min(2, 'Enter card holder name'),
});

const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: `1px solid ${C.border}`, fontFamily: BODY, fontSize: '0.92rem',
    color: C.text, background: C.white, outline: 'none', boxSizing: 'border-box',
};

const formatCurrency = (value, code, currencies) => {
    const info = currencies[code] || currencies.USD;
    const numeric = Number(value || 0);
    return new Intl.NumberFormat(info.locale, {
        style: 'currency',
        currency: info.code,
        minimumFractionDigits: info.code === 'JPY' ? 0 : 2,
        maximumFractionDigits: info.code === 'JPY' ? 0 : 2,
    }).format(numeric);
};

const TopUpPage = () => {
    const navigate = useNavigate();
    const { currency, currencies, rates, formatPrice } = useCurrency();
    const [focused, setFocused] = useState(null);
    const [successText, setSuccessText] = useState('');
    const [manualCurrency, setManualCurrency] = useState(currency);
    const { data: wallet } = useMyWallet();
    const mutation = useTopUpWallet();

    const defaultAmount = useMemo(() => MIN_WALLET_ENTRY_USD, []);
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
        resolver: zodResolver(schema),
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: {
            amount: defaultAmount,
            currency_mode: 'auto',
            currency_code: currency,
            card_number: '',
            expiry: '',
            cvv: '',
            holder_name: '',
        },
    });

    const amount = watch('amount');
    const currencyMode = watch('currency_mode');
    const currencyCode = watch('currency_code');
    const activeCurrency = currencyMode === 'auto' ? currency : (currencyCode || currency);
    const exchangeRate = rates[activeCurrency] || 1;
    const usdEquivalent = activeCurrency === 'USD' ? Number(amount || 0) : Number(amount || 0) / exchangeRate;
    const walletBalanceUsd = Number(wallet?.available_balance || 0);
    const isWalletZero = walletBalanceUsd <= 0;
    const minAmountInActiveCurrency = useMemo(() => {
        const raw = activeCurrency === 'USD'
            ? MIN_WALLET_ENTRY_USD
            : MIN_WALLET_ENTRY_USD * (rates[activeCurrency] || 1);
        const decimals = activeCurrency === 'JPY' ? 0 : 2;
        return Number(raw.toFixed(decimals));
    }, [activeCurrency, rates]);
    const maxAmountInActiveCurrency = useMemo(() => {
        const raw = activeCurrency === 'USD'
            ? MAX_TOP_UP_USD
            : MAX_TOP_UP_USD * (rates[activeCurrency] || 1);
        const decimals = activeCurrency === 'JPY' ? 0 : 2;
        return Number(raw.toFixed(decimals));
    }, [activeCurrency, rates]);
    const isBelowMinimumForZeroWallet = isWalletZero && Number(amount || 0) < minAmountInActiveCurrency;
    const isAboveMaximumTopUp = Number(amount || 0) > maxAmountInActiveCurrency;

    useEffect(() => {
        if (currencyMode === 'auto') {
            setValue('currency_code', currency, { shouldValidate: true });
        }
    }, [currency, currencyMode, setValue]);

    useEffect(() => {
        if (currencyMode === 'manual' && !currencyCode) {
            setValue('currency_code', currency, { shouldValidate: true });
            setManualCurrency(currency);
        }
    }, [currency, currencyCode, currencyMode, setValue]);

    useEffect(() => {
        if (!isWalletZero) return;
        const current = Number(amount || 0);
        if (current === minAmountInActiveCurrency) return;
        setValue('amount', minAmountInActiveCurrency, { shouldValidate: true });
    }, [isWalletZero, minAmountInActiveCurrency, amount, setValue]);

    const onSubmit = async (values) => {
        setSuccessText('');
        const selectedCode = values.currency_mode === 'auto' ? currency : values.currency_code;
        const selectedRate = rates[selectedCode] || 1;
        const normalizedAmount = selectedCode === 'USD'
            ? Number(values.amount)
            : Number(values.amount) / selectedRate;

        if (isWalletZero && normalizedAmount < MIN_WALLET_ENTRY_USD) {
            throw new Error(`When your wallet is zero, the minimum top-up is ${formatCurrency(MIN_WALLET_ENTRY_USD, 'USD', currencies)} (${formatCurrency(minAmountInActiveCurrency, activeCurrency, currencies)} in ${activeCurrency}).`);
        }
        if (normalizedAmount > MAX_TOP_UP_USD) {
            throw new Error(`Top-up amount is too high. Maximum allowed is ${formatCurrency(MAX_TOP_UP_USD, 'USD', currencies)} (${formatCurrency(maxAmountInActiveCurrency, activeCurrency, currencies)} in ${activeCurrency}).`);
        }

        const result = await mutation.mutateAsync({
            amount: Number(normalizedAmount.toFixed(2)),
            currency_mode: values.currency_mode,
            currency_code: selectedCode,
            display_amount: Number(values.amount),
            card_number: values.card_number,
            expiry: values.expiry,
            cvv: values.cvv,
            holder_name: values.holder_name,
        });

        const walletPayload = result?.data ?? result;
        setSuccessText(`Wallet topped up successfully. New balance: ${formatPrice(walletPayload?.available_balance || 0)}`);
    };

    const f = (key) => ({
        onFocus: () => setFocused(key),
        onBlur: () => setFocused(null),
    });

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: BODY }}>
            <main style={{ maxWidth: 900, margin: '0 auto', padding: '44px 24px 80px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-end', marginBottom: 28 }}>
                    <div>
                        <h1 style={{ fontFamily: DISPLAY, fontSize: '1.8rem', color: C.text, margin: 0 }}>Virtual Wallet Top-Up</h1>
                        <p style={{ margin: '8px 0 0', color: C.muted, fontFamily: BODY, fontSize: '0.92rem' }}>
                            Simulated payment only. No real card verification is performed.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => navigate('/wallet/gem-store')} style={{
                            padding: '10px 16px', borderRadius: 10, border: `1px solid ${C.border}`,
                            background: C.white, color: C.sapphire, fontFamily: BODY, fontWeight: 600, cursor: 'pointer',
                        }}>
                            Gem Store
                        </button>
                        <button onClick={() => navigate('/wallet/withdraw')} style={{
                            padding: '10px 16px', borderRadius: 10, border: `1px solid ${C.border}`,
                            background: C.white, color: C.sapphire, fontFamily: BODY, fontWeight: 600, cursor: 'pointer',
                        }}>
                            Withdraw
                        </button>
                        <button onClick={() => navigate(-1)} style={{
                            padding: '10px 16px', borderRadius: 10, border: `1px solid ${C.border}`,
                            background: C.white, color: C.sapphire, fontFamily: BODY, fontWeight: 600, cursor: 'pointer',
                        }}>
                            Back
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 20 }}>
                    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div>
                                <div style={{ fontFamily: DISPLAY, fontSize: '0.72rem', color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Demo Payment</div>
                                <div style={{ fontFamily: SERIF, fontSize: '1.2rem', color: C.sapphire, fontWeight: 700 }}>Top up your wallet</div>
                            </div>
                            <div style={{ background: C.goldLight, color: C.gold, borderRadius: 999, padding: '5px 10px', fontSize: '0.72rem', fontFamily: BODY, fontWeight: 700 }}>
                                Simulated Gateway
                            </div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <input type="hidden" {...register('currency_mode')} />
                            <input type="hidden" {...register('currency_code')} />

                            <div style={{ display: 'grid', gap: 14 }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 6, fontFamily: DISPLAY, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', color: C.faint }}>Amount ({activeCurrency})</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'start' }}>
                                        <input
                                            type="number"
                                            min="1"
                                            step="0.01"
                                            {...register('amount')}
                                            {...f('amount')}
                                            style={{ ...inputStyle, borderColor: focused === 'amount' ? C.gold : C.border }}
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                {['auto', 'manual'].map((mode) => (
                                                    <button
                                                        key={mode}
                                                        type="button"
                                                        onClick={() => setValue('currency_mode', mode, { shouldValidate: true })}
                                                        style={{
                                                            padding: '8px 10px', borderRadius: 10,
                                                            border: `1px solid ${currencyMode === mode ? C.gold : C.border}`,
                                                            background: currencyMode === mode ? C.goldLight : C.white,
                                                            color: currencyMode === mode ? C.gold : C.text,
                                                            fontFamily: BODY, fontSize: '0.78rem', fontWeight: 700,
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        {mode === 'auto' ? 'Auto' : 'Manual'}
                                                    </button>
                                                ))}
                                            </div>
                                            <select
                                                value={currencyMode === 'auto' ? currency : manualCurrency}
                                                disabled={currencyMode === 'auto'}
                                                onChange={(e) => {
                                                    setManualCurrency(e.target.value);
                                                    setValue('currency_code', e.target.value, { shouldValidate: true });
                                                }}
                                                style={{
                                                    ...inputStyle,
                                                    width: 170,
                                                    opacity: currencyMode === 'auto' ? 0.75 : 1,
                                                    cursor: currencyMode === 'auto' ? 'not-allowed' : 'pointer',
                                                }}
                                            >
                                                {Object.values(SUPPORTED_CURRENCIES).map((item) => (
                                                    <option key={item.code} value={item.code}>
                                                        {item.flag} {item.code} - {item.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    {errors.amount && <div style={{ marginTop: 4, color: C.red, fontSize: '0.78rem' }}>{errors.amount.message}</div>}
                                    <div style={{ marginTop: 6, color: C.faint, fontSize: '0.78rem' }}>
                                        {currencyMode === 'auto'
                                            ? `Auto mode follows your site currency (${currency}).`
                                            : 'Manual mode lets you choose the demo currency independently.'}
                                    </div>
                                    <div style={{ marginTop: 6, color: C.muted, fontSize: '0.8rem' }}>
                                        Equivalent in USD: {formatCurrency(usdEquivalent, 'USD', currencies)}
                                    </div>
                                    <div style={{ marginTop: 6, color: isAboveMaximumTopUp ? C.red : C.faint, fontSize: '0.8rem', fontWeight: 600 }}>
                                        Maximum allowed: {formatCurrency(maxAmountInActiveCurrency, activeCurrency, currencies)} (equals {formatCurrency(MAX_TOP_UP_USD, 'USD', currencies)}).
                                    </div>
                                    {isWalletZero && (
                                        <div style={{ marginTop: 6, color: isBelowMinimumForZeroWallet ? C.red : C.faint, fontSize: '0.8rem', fontWeight: 600 }}>
                                            Minimum allowed while wallet is zero: {formatCurrency(minAmountInActiveCurrency, activeCurrency, currencies)} (equals {formatCurrency(MIN_WALLET_ENTRY_USD, 'USD', currencies)}).
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: 6, fontFamily: DISPLAY, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', color: C.faint }}>Fake card number</label>
                                    <input
                                        type="text"
                                        placeholder="1234 5678 9012 3456"
                                        {...register('card_number')}
                                        {...f('card_number')}
                                        style={{ ...inputStyle, borderColor: focused === 'card_number' ? C.gold : C.border }}
                                    />
                                    {errors.card_number && <div style={{ marginTop: 4, color: C.red, fontSize: '0.78rem' }}>{errors.card_number.message}</div>}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: 6, fontFamily: DISPLAY, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', color: C.faint }}>Expiry</label>
                                        <input
                                            type="text"
                                            placeholder="MM / YY"
                                            {...register('expiry')}
                                            {...f('expiry')}
                                            style={{ ...inputStyle, borderColor: focused === 'expiry' ? C.gold : C.border }}
                                        />
                                        {errors.expiry && <div style={{ marginTop: 4, color: C.red, fontSize: '0.78rem' }}>{errors.expiry.message}</div>}
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: 6, fontFamily: DISPLAY, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', color: C.faint }}>CVV</label>
                                        <input
                                            type="password"
                                            {...register('cvv')}
                                            {...f('cvv')}
                                            style={{ ...inputStyle, borderColor: focused === 'cvv' ? C.gold : C.border }}
                                        />
                                        {errors.cvv && <div style={{ marginTop: 4, color: C.red, fontSize: '0.78rem' }}>{errors.cvv.message}</div>}
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: 6, fontFamily: DISPLAY, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', color: C.faint }}>Card holder</label>
                                        <input
                                            type="text"
                                            {...register('holder_name')}
                                            {...f('holder_name')}
                                            style={{ ...inputStyle, borderColor: focused === 'holder_name' ? C.gold : C.border }}
                                        />
                                        {errors.holder_name && <div style={{ marginTop: 4, color: C.red, fontSize: '0.78rem' }}>{errors.holder_name.message}</div>}
                                    </div>
                                </div>
                            </div>

                            {successText && (
                                <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 10, background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', color: C.green, fontSize: '0.88rem' }}>
                                    {successText}
                                </div>
                            )}

                            {mutation.error && (
                                <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 10, background: 'rgba(185,28,28,0.08)', border: '1px solid rgba(185,28,28,0.2)', color: C.red, fontSize: '0.88rem' }}>
                                    {mutation.error.message || 'Top-up failed.'}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={mutation.isPending || isBelowMinimumForZeroWallet || isAboveMaximumTopUp}
                                style={{
                                    marginTop: 18, width: '100%', padding: '14px 16px', borderRadius: 12, border: 'none',
                                    background: C.sapphire, color: '#fff', fontFamily: BODY, fontSize: '0.92rem', fontWeight: 700,
                                    cursor: (mutation.isPending || isBelowMinimumForZeroWallet || isAboveMaximumTopUp) ? 'not-allowed' : 'pointer',
                                    opacity: (mutation.isPending || isBelowMinimumForZeroWallet || isAboveMaximumTopUp) ? 0.7 : 1,
                                }}
                            >
                                {mutation.isPending
                                    ? 'Processing…'
                                    : isAboveMaximumTopUp
                                        ? `Maximum ${formatCurrency(maxAmountInActiveCurrency, activeCurrency, currencies)} Allowed`
                                    : isBelowMinimumForZeroWallet
                                        ? `Minimum ${formatCurrency(minAmountInActiveCurrency, activeCurrency, currencies)} Required`
                                        : `Pay ${formatCurrency(Number(amount || 0), activeCurrency, currencies)}`}
                            </button>
                        </form>
                    </div>

                    <div style={{ display: 'grid', gap: 16 }}>
                        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
                            <div style={{ fontFamily: DISPLAY, fontSize: '0.68rem', color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Current Balance</div>
                            <div style={{ fontFamily: SERIF, fontSize: '2rem', fontWeight: 700, color: C.sapphire, marginTop: 8 }}>
                                {formatPrice(wallet?.available_balance || 0)}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: C.muted, marginTop: 8 }}>Locked deposit: {formatPrice(wallet?.locked_balance || 0)}</div>
                            <div style={{ fontSize: '0.82rem', color: C.muted, marginTop: 4 }}>Gem balance: {Number(wallet?.gem_balance || 0)} Gems</div>
                        </div>
                        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
                            <div style={{ fontFamily: DISPLAY, fontSize: '0.68rem', color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Quick Top-Up</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
                                {[300, 1000, 2500, 4000].map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => {
                                            const displayValue = activeCurrency === 'USD'
                                                ? value
                                                : Number((value * (rates[activeCurrency] || 1)).toFixed(activeCurrency === 'JPY' ? 0 : 2));
                                            setValue('amount', displayValue, { shouldValidate: true });
                                        }}
                                        style={{
                                            padding: '9px 12px', borderRadius: 10, border: `1px solid ${C.border}`,
                                            background: Number(amount || 0) === (activeCurrency === 'USD' ? value : Number((value * (rates[activeCurrency] || 1)).toFixed(activeCurrency === 'JPY' ? 0 : 2))) ? C.goldLight : C.white,
                                            color: Number(amount || 0) === (activeCurrency === 'USD' ? value : Number((value * (rates[activeCurrency] || 1)).toFixed(activeCurrency === 'JPY' ? 0 : 2))) ? C.gold : C.text,
                                            fontFamily: BODY, fontWeight: 600, cursor: 'pointer',
                                        }}
                                    >
                                        {formatPrice(value)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TopUpPage;
