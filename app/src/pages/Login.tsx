import React, {
    ReactElement,
} from 'react';
import DexButton from '../components/DexButton';
import '../css/main.css';

const clientID = 'dVAgtrxIXoOvgLaSijpyr16WA3ss0kY9';
const redirectURI = 'http://localhost:3000/api/login'

const Login = (): ReactElement => {
    const dexcomAuth = 'https://sandbox-api.dexcom.com/v2/oauth2/login?client_id=' + clientID + "&redirect_uri=" + redirectURI + "&response_type=code&scope=offline_access";
    return (
        <div className='relative width-100 height-100'>
            <DexButton className='absolute-centered' goto={dexcomAuth}>Authorize Dexcom</DexButton>
            <button></button>
        </div>
    );
};

export default Login;