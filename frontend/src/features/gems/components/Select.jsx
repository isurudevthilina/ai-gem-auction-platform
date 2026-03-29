import { T, inputBase } from './formTokens';

const Select = ({ value, onChange, options, placeholder, error, onFocus, onBlur }) => (
    <div>
        <select value={value || ''} onChange={e => onChange(e.target.value)}
            onFocus={onFocus} onBlur={onBlur}
            style={{
                ...inputBase,
                color: value ? T.text : T.faint,
                borderColor: error ? T.error : T.border,
                cursor: 'pointer', appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B6B7B' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 14px center',
                paddingRight: 36,
            }}>
            <option value="" disabled>{placeholder}</option>
            {options.map(o => typeof o === 'string'
                ? <option key={o} value={o}>{o}</option>
                : <option key={o.value} value={o.value}>{o.label}</option>
            )}
        </select>
    </div>
);

export default Select;
