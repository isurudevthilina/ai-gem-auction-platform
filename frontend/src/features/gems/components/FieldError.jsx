import { T, BODY } from './formTokens';

const FieldError = ({ message }) => message ? (
    <p style={{ margin: '4px 0 0', fontSize: '0.76rem', color: T.error, fontFamily: BODY }}>{message}</p>
) : null;

export default FieldError;
