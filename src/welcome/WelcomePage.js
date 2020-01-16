import React, {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {do_register} from '../state/actions';

export function WelcomePage(props) {
    const dispatch=useDispatch();
    const [regcode,set_regcode]=useState('');

    return (
        <div>
            <p>Welcome page</p>
            <p>Reg code: <input value={regcode} onChange={(e)=>set_regcode(e.target.value)} /></p>
            <p><button onClick={()=>dispatch(do_register(regcode))}>register</button></p>
        </div>
    )
}