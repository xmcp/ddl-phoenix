import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {do_splash_callback} from '../state/actions';

function SplashAlphaTest(props) {
    const dispatch=useDispatch();

    return (
        <div>
            <p>splash alpha test</p>
            <p>{props.handout.msg}</p>
            <p><button onClick={()=>dispatch(do_splash_callback(props.index,{agree: true}))}>i agree</button></p>
        </div>
    );
}

export function SplashScreen(props) {
    const splash=useSelector((state)=>state.splash);

    if(splash.index===0)
        return (<SplashAlphaTest index={splash.index} handout={splash.handout} />);
    else
        return (
            <div>
                <p>unknown splash index: {splash.index}</p>
                <p>please update front-end</p>
            </div>
        );
}