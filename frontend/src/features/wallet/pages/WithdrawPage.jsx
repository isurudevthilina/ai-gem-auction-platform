import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../../../context/CurrencyContext';
import { useMyWallet, useWithdrawToBank } from '../hooks/useWallet';

const C = {
    bg: '#F0EDE8', white: '#FFFFFF', sapphire: '#1A4D8C', gold: '#C4892A',
    green: '#16a34a', red: '#B91C1C', text: '#1A1A2E', muted: '#6B6B7B',
    faint: '#9A9AAB', border: '#E0DCD6',
};
const DISPLAY = "'Cinzel',serif";
const BODY = "'Jost','Inter',sans-serif";

const schema = z.object({
    bank_name: z.string().min(2, 'Bank name is required').max(120, 'Bank name is too long'),
    account_number: z.string().min(6, 'Account number is too short').max(40, 'Account number is too long'),
    display_amount: z.coerce.number().positive('Amount must be greater than zero').max(100000, 'Amount is too high'),
});

const WithdrawPage = () => {
    const navigate = useNavigate();
    const { currency, rates, formatPrice } = useCurrency();
    const { data: wallet } = useMyWallet();
    const withdraw = useWithdrawToBank();
    const [successText, setSuccessText] = useState('');

    const rate = rates[currency] || 1;

    const { register, watch, setValue, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: {
            bank_name: '',
            account_number: '',
            display_amount: 50,
        },
    });

    const displayAmount = Number(watch('display_amount') || 0);
    const usdAmount = currency === 'USD' ? displayAmount : displayAmount / rate;
    const availableUsd = Number(wallet?.available_balance || 0);
    const exceedsBalance = usdAmount > availableUsd;

    const onSubmit = async (values) => {
        setSuccessText('');
        const normalizedUsd = currency === 'USD'
            ? Number(values.display_amount)
            : Number(values.display_amount) / rate;

        const result = await withdraw.mutateAsync({
            bank_name: values.bank_name,
            account_number: values.account_number,
            amount: Number(normalizedUsd.toFixed(2)),
        });

        const payload = result?.data ?? result;
        setSuccessText(`Transfer Successful. Ref: ${payload?.withdrawal?.transfer_reference || 'SIMULATED'}`);
    };

    return (
        <div style={{ minHeight: '100vh', background: C.bg, fontFamily: BODY }}>
            <main style={{ maxWidth: 900, margin: '0 auto', padding: '44px 24px 80px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
                    <div>
                        <h1 style={{ fontFamily: DISPLAY, fontSize: '1.8rem', color: C.text, margin: 0 }}>Withdraw to Bank</h1>
                        <p style={{ margin: '8px 0 0', color: C.muted, fontSize: '0.92rem' }}>
                            Simulated transfer only. Funds are deducted from Available Balance.
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
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div style={{ display: 'grid', gap: 12 }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 6, color: C.muted, fontSize: '0.8rem' }}>Bank Name</label>
                                    <input
                                        type="text"
                                        {...register('bank_name')}
                                        style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}` }}
                                    />
                                    {errors.bank_name && <div style={{ marginTop: 4, color: C.red, fontSize: '0.78rem' }}>{errors.bank_name.message}</div>}
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: 6, color: C.muted, fontSize: '0.8rem' }}>Account Number</label>
                                    <input
                                        type="text"
                                        {...register('account_number')}
                                        style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}` }}
                                    />
                                    {errors.account_number && <div style={{ marginTop: 4, color: C.red, fontSize: '0.78rem' }}>{errors.account_number.message}</div>}
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: 6, color: C.muted, fontSize: '0.8rem' }}>Amount ({currency})</label>
                                    <input
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        {...register('display_amount')}
                                        style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.border}` }}
                                    />
                                    {errors.display_amount && <div style={{ marginTop: 4, color: C.red, fontSize: '0.78rem' }}>{errors.display_amount.message}</div>}
                                    <div style={{ marginTop: 6, color: C.faint, fontSize: '0.8rem' }}>
                                        Deducted from wallet as USD: {formatPrice(usdAmount)}
                                    </div>
                                    {exceedsBalance && (
                                        <div style={{ marginTop: 6, color: C.red, fontSize: '0.8rem', fontWeight: 600 }}>
                                            Insufficient available balance.
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                    {[50, 100, 250, 500].map((usd) => {
                                        const display = currency === 'USD' ? usd : Number((usd * rate).toFixed(currency === 'JPY' ? 0 : 2));
                                        return (
                                            <button
                                                key={usd}
                                                type="button"
                                                onClick={() => setValue('display_amount', display, { shouldValidate: true })}
                                                style={{
                                                    padding: '8px 10px', borderRadius: 10,
                                                    border: `1px solid ${C.border}`, background: C.white,
                                                    color: C.text, cursor: 'pointer', fontSize: '0.8rem',
                                                }}
                                            >
                                                {formatPrice(usd)}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={withdraw.isPending || exceedsBalance}
                                style={{
                                    marginTop: 16, width: '100%', padding: '12px 16px', borderRadius: 10,
                                    border: 'none', background: C.sapphire, color: '#fff', fontWeight: 700,
                                    cursor: withdraw.isPending || exceedsBalance ? 'not-allowed' : 'pointer',
                                    opacity: withdraw.isPending || exceedsBalance ? 0.7 : 1,
                                }}
                            >
                                {withdraw.isPending ? 'Transferring...' : 'Transfer to Bank'}
                            </button>
                        </form>

                        {withdraw.error && (
                            <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(185,28,28,0.08)', color: C.red, border: '1px solid rgba(185,28,28,0.2)' }}>
                                {withdraw.error.message || 'Transfer failed.'}
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
                            <div style={{ color: C.faint, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: DISPLAY }}>Available Balance</div>
                            <div style={{ marginTop: 8, color: C.sapphire, fontSize: '1.8rem', fontWeight: 700, fontFamily: DISPLAY }}>
                                {formatPrice(wallet?.available_balance || 0)}
                            </div>
                            <div style={{ marginTop: 8, color: C.muted, fontSize: '0.8rem' }}>Locked funds: {formatPrice(wallet?.locked_balance || 0)}</div>
                        </div>
                        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
                            <div style={{ color: C.faint, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: DISPLAY }}>Simulation Note</div>
                            <div style={{ marginTop: 8, color: C.muted, fontSize: '0.82rem', lineHeight: 1.5 }}>
                                This withdrawal is simulated for demo purposes. No real banking transfer is executed.
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default WithdrawPage;
