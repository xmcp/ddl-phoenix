import React, {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {do_refresh, get_token} from '../state/actions';
import {App} from '../app/App';
import {LoginPopup} from '../infrastructure/widgets';
import {WelcomePage} from '../welcome/WelcomePage';
import {SplashScreen} from '../welcome/SplashScreen';

function Root(props) {
    const dispatch=useDispatch();
    const token=useSelector((state)=>state.local.token);

    useEffect(()=>{
        dispatch(get_token());
    },[dispatch]);
    useEffect(()=>{
        if(token)
            dispatch(do_refresh());
    },[dispatch,token]);

    const error=useSelector((state)=>state.error);
    const error_msg=useSelector((state)=>state.error_msg);
    const loading_status=useSelector((state)=>state.local.loading.status);

    useEffect(()=>{
        if(error==='PROCEED')
            dispatch(do_refresh());
    },[dispatch,error]);

    if(error===null)
        return (<App />);

    if(loading_status==='loading')
        return (<div>loading</div>);

    function on_got_token(token) {
        localStorage['TOKEN']=token;
        dispatch(get_token());
    }

    // below: deal with errors

    if(error==='PHOENIX_NO_DATA')
        return (
            <div>
                <p>phoenix no data</p>
                <p><button onClick={()=>dispatch(do_refresh())}>refresh</button></p>
            </div>
        );
    else if(error==='PHOENIX_NO_TOKEN')
        return (
            <LoginPopup token_callback={on_got_token}>{(do_popup)=>(
                <div>
                    <p>phoenix no token</p>
                    <p><button onClick={do_popup}>do popup</button></p>
                </div>
            )}</LoginPopup>
        );
    else if(error==='AUTH_REQUIRED')
        return (<WelcomePage />);
    else if(error==='SPLASH_REQUIRED')
        return (<SplashScreen />);
    else if(error==='SISTER_ERROR')
        return (
            <div>
                <p>sister error: {error_msg}</p>
                <p><button onClick={()=>dispatch(do_refresh())}>refresh</button></p>
            </div>
        );
    else
        return (
            <div>
                <p>unknown error: {error}</p>
                <p>{error_msg}</p>
            </div>
        );
}

export default Root;
