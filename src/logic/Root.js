import React, {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Result, Button, Icon} from 'antd';

import {App} from '../app/App';
import {WelcomePage} from '../welcome/WelcomePage';
import {SplashScreen} from '../welcome/SplashScreen';
import {WithFooter} from '../app/Footer';
import {LoginPopup} from '../infrastructure/widgets';

import {do_refresh, get_token} from '../state/actions';

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
        return (
            <WithFooter>
                <Result
                    icon={<Icon type="loading" />}
                    title="不咕计划"
                    subTitle="少女刷夜中"
                />
            </WithFooter>
        );

    let refresh_btn=(
        <Button key="refresh" type="primary" onClick={()=>dispatch(do_refresh())}>重试</Button>
    );

    function on_got_token(token) {
        localStorage['TOKEN']=token;
        dispatch(get_token());
    }

    // below: deal with errors

    if(error==='PHOENIX_NO_DATA')
        return (
            <WithFooter>
                <Result
                    icon={<Icon type="wifi" />}
                    status="error"
                    title={"加载失败"}
                    extra={[refresh_btn]}
                />
            </WithFooter>
        );
    else if(error==='PHOENIX_NO_TOKEN')
        return (
            <LoginPopup token_callback={on_got_token}>{(do_popup)=>(
                <WithFooter>
                    <Result
                        status="info"
                        title="不咕计划"
                        subTitle="开源的在线 Deadline 管理工具"
                        extra={<Button type="primary" onClick={do_popup}>用 PKU Helper 账号登录</Button>}
                    />
                </WithFooter>
            )}</LoginPopup>
        );
    else if(error==='AUTH_REQUIRED')
        return (<WelcomePage />);
    else if(error==='SPLASH_REQUIRED')
        return (<SplashScreen />);
    else if(error==='SISTER_ERROR')
        return (
            <WithFooter>
                <Result
                    status="error"
                    title={error_msg}
                    extra={[refresh_btn]}
                />
            </WithFooter>
        );
    else // unknown error
        return (
            <WithFooter>
                <Result
                    status="error"
                    title={error_msg}
                    subTitle={'未知错误 '+error}
                    extra={[refresh_btn]}
                />
            </WithFooter>
        );
}

export default Root;
