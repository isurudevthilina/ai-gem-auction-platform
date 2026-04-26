import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../../../context/CurrencyContext';
import { useBuyGems, useMyWallet } from '../hooks/useWallet';

const C = {
    bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
    goldLight: 'rgba(196,137,42,0.10)', green: '#16a34a', red: '#B91C1C',
    text: '#1A1A2E', muted: '#6B6B7B', faint: '#9A9AAB', border: '#E0DCD6',
};
const DISPLAY = "'Cinzel',serif";
const BODY = "'Jost','Inter',sans-serif";
const GEMS_PER_USD = 10;

const schema = z.object({
    display_amount: z.coerce.number().positive('Enter an amount').max(100000, 'Amount is too high'),
});

const GemStorePage = () => {
    const navigate = useNavigate();
    const { currency, rates, formatPrice } = useCurrency();
    const { data: wallet } = useMyWallet();
    const buyGems = useBuyGems();
    const [successText, setSuccessText] = useState('');

    const rate = rates[currency] || 1;

    const { register, watch, setValue, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: { display_amount: 100 },
    });

    const displayAmount = Number(watch('display_amount') || 0);
    const usdAmount = currency === 'USD' ? displayAmount : displayAmount / rate;
    const gemsToReceive = Math.floor(Number(usdAmount || 0) * GEMS_PER_USD);

    const packs = useMemo(() => {
        const usdPacks = [10, 25, 50, 100];
        return usdPacks.map((usd) => ({
            usd,
            display: currency === 'USD' ? usd : Number((usd * rate).toFixed(currency === 'JPY' ? 0 : 2)),
            gems: usd * GEMS_PER_USD,
        }));
    }, [currency, rate]);

    const onSubmit = async (values) => {
        setSuccessText('');
        const selectedDisplayAmount = Number(values.display_amount || 0);
        const normalizedUsd = currency === 'USD' ? selectedDisplayAmount : selectedDisplayAmount / rate;

        const result = await buyGems.mutateAsync({ usd_amount: Number(normalizedUsd.toFixed(2)) });
        const payload = result?.data ?? result;
        setSuccessText(`Purchase successful. You received ${payload?.gems_received || 0} Gems.`);
    };

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: BODY }}>
            <main style={{ maxWidth: 900, margin: '0 auto', padding: '44px 24px 80px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
                    <div>
                        <h1 style={{ fontFamily: DISPLAY, fontSize: '1.8rem', color: C.text, margin: 0 }}>Gem Store</h1>
                        <p style={{ margin: '8px 0 0', color: C.muted, fontSize: '0.92rem' }}>
                            Spend wallet balance to buy in-app Gems. Exchange rate: $10 = 100 Gems.
                        </p>
                    </div>
                    <button onClick={() => navigate('/wallet/top-up')} style={{
                        padding: '10px 16px', borderRadius: 10, border: `1px solid ${C.border}`,
                        background: C.white, color: C.sapphire, fontWeight: 600, cursor: 'pointer',
                    }}>
                        Wallet Home
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 20 }}>
                    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
                        <div style={{ fontFamily: DISPLAY, fontSize: '0.72rem', color: C.faint, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Buy Gems
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: 14 }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: C.muted, marginBottom: 6 }}>
                                Spend Amount ({currency})
                            </label>
                            <input
                                type="number"
                                min="1"
                                step="0.01"
                                {...register('display_amount')}
                                style={{
                                    width: '100%', padding: '12px 14px', borderRadius: 10,
                                    border: `1px solid ${C.border}`, fontSize: '0.95rem',
                                }}
                            />
                            {errors.display_amount && <div style={{ marginTop: 5, color: C.red, fontSize: '0.78rem' }}>{errors.display_amount.message}</div>}

                            <div style={{ marginTop: 12, color: C.muted, fontSize: '0.83rem' }}>
                                USD equivalent: {formatPrice(usdAmount)}
                            </div>
                            <div style={{ marginTop: 6, color: C.gold, fontSize: '0.86rem', fontWeight: 700 }}>
                                Gems to receive: {Number.isFinite(gemsToReceive) ? gemsToReceive : 0}
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
                                {packs.map((pack) => (
                                    <button
                                        key={pack.usd}
                                        type="button"
                                        onClick={() => setValue('display_amount', pack.display, { shouldValidate: true })}
                                        style={{
                                            padding: '8px 10px', borderRadius: 10,
                                            border: `1px solid ${C.border}`,
                                            background: C.goldLight, color: C.text,
                                            cursor: 'pointer', fontSize: '0.8rem',
                                        }}
                                    >
                                        {formatPrice(pack.usd)} {'->'} {pack.gems} Gems
                                    </button>
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={buyGems.isPending || gemsToReceive <= 0}
                                style={{
                                    marginTop: 16, width: '100%', padding: '12px 16px', borderRadius: 10,
                                    border: 'none', background: C.sapphire, color: '#fff', fontWeight: 700,
                                    cursor: buyGems.isPending ? 'wait' : 'pointer',
                                    opacity: buyGems.isPending || gemsToReceive <= 0 ? 0.7 : 1,
                                }}
                            >
                                {buyGems.isPending ? 'Processing...' : `Buy ${gemsToReceive > 0 ? gemsToReceive : ''} Gems`}
                            </button>
                        </form>

                        {buyGems.error && (
                            <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(185,28,28,0.08)', color: C.red, border: '1px solid rgba(185,28,28,0.2)' }}>
                                {buyGems.error.message || 'Gem purchase failed.'}
                            </div>
                        )}
                        {successText && (
                            <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(22,163,74,0.08)', color: C.green, border: '1px solid rgba(22,163,74,0.2)' }}>
                                {successText}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gap: 14 }}>
                        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
                            <div style={{ color: C.faint, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: DISPLAY }}>Available Wallet</div>
                            <div style={{ marginTop: 8, color: C.sapphire, fontSize: '1.8rem', fontWeight: 700, fontFamily: DISPLAY }}>
                                {formatPrice(wallet?.available_balance || 0)}
                            </div>
                            <div style={{ marginTop: 8, color: C.muted, fontSize: '0.8rem' }}>Locked funds: {formatPrice(wallet?.locked_balance || 0)}</div>
                        </div>
                        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
                            <div style={{ color: C.faint, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: DISPLAY }}>Gem Balance</div>
                            <div style={{ marginTop: 8, color: C.gold, fontSize: '1.8rem', fontWeight: 700, fontFamily: DISPLAY }}>
                                {Number(wallet?.gem_balance || 0)} Gems
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GemStorePage;
