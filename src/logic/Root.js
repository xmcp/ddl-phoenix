import React, {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Result, Button} from 'antd';

import {App} from '../app/App';
import {WelcomePage, AskTokenPage} from '../welcome/WelcomePage';
import {SplashScreen} from '../welcome/SplashScreen';
import {WithFooter} from '../app/Footer';

import {do_refresh, get_token, close_modal} from '../state/actions';

import {LoadingOutlined, WifiOutlined, RobotOutlined, BugOutlined, GithubOutlined} from '@ant-design/icons';

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
        if(error==='PROCEED') {
            dispatch(close_modal());
            dispatch(do_refresh());
        }
    },[dispatch,error]);

    const LOADING_UI=(
        <WithFooter>
            <Result
                icon={<LoadingOutlined />}
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

    function force_reload() {
        if('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations()
                .then((registrations)=>{
                    for(let registration of registrations) {
                        console.log('unregister',registration);
                        registration.unregister();
                    }
                });
        }
        setTimeout(()=>{
            window.location.reload(true);
        },200);
    }

    if(error===null)
        return (<App />);

    if(loading_status==='loading')
        return LOADING_UI;

    // below: deal with errors

    if(error==='PHOENIX_NO_DATA') // upon initialization
        return LOADING_UI;
    else if(error==='PHOENIX_NO_TOKEN')
        return (<AskTokenPage on_got_token={on_got_token} />);
    else if(error==='SISTER_VER_MISMATCH')
        return (
            <WithFooter>
                <Result
                    icon={<RobotOutlined />}
                    status="error"
                    title="不支持当前版本"
                    subTitle={error_msg}
                    extra={[
                        <Button key="refresh" type="primary" onClick={force_reload}>刷新页面</Button>,
                    ]}
                />
            </WithFooter>
        );
    else if(error==='BACKEND_EXCEPTION')
        return (
            <WithFooter>
                <Result
                    icon={<BugOutlined />}
                    status="error"
                    title="后端异常（这是 Bug）"
                    subTitle={error_msg}
                    extra={[
                        refresh_btn,
                        <Button key="report-bug" href="https://github.com/pkuhelper-web/bee/issues" target="_blank">
                            <GithubOutlined /> 反馈给开发者
                        </Button>,
                    ]}
                />
            </WithFooter>
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
