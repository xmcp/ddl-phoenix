import React, {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Result, Button} from 'antd';

import {App} from '../app/App';
import {WelcomePage, AskTokenPage} from '../welcome/WelcomePage';
import {SplashScreen} from '../welcome/SplashScreen';
import {WithFooter} from '../app/Footer';

import {do_refresh, init_token, close_modal, set_is_slim} from '../state/actions';

import {LoadingOutlined, RobotOutlined, BugOutlined, GithubOutlined, WifiOutlined} from '@ant-design/icons';

const LG_BREAKPOINT_PX=800;

function Root(props) {
    const dispatch=useDispatch();
    const token=useSelector((state)=>state.local.token);

    // init process
    useEffect(()=>{
        dispatch(init_token());
    },[dispatch]);
    useEffect(()=>{
        if(token)
            dispatch(do_refresh());
    },[dispatch,token]);

    // update slim and viewport_height upon resize
    useEffect(()=>{
        function on_resize() {
            if(window.innerWidth>=LG_BREAKPOINT_PX)
                dispatch(set_is_slim(false));
            else
                dispatch(set_is_slim(true));

            document.body.style.setProperty('--viewport-height',window.innerHeight+'px');
        }
        on_resize();
        window.addEventListener('resize',on_resize,{passive: true});
        return ()=>{
            window.removeEventListener('resize',on_resize,{passive: true});
        };
    },[]);

    const error=useSelector((state)=>state.error);
    const error_msg=useSelector((state)=>state.error_msg);
    const loading_status=useSelector((state)=>state.local.loading.status);

    // handle PROCEDD error
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

    let retry_btn=(
        <Button key="refresh" type="primary" onClick={()=>dispatch(do_refresh())}>重试</Button>
    );

    function on_got_token(token) {
        localStorage['TOKEN']=token;
        dispatch(init_token());
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
    else if(error==='PHOENIX_NO_NETWORK')
        return (
            <WithFooter>
                <Result
                    icon={<WifiOutlined />}
                    status="error"
                    title="网络错误"
                    extra={[retry_btn]}
                />
            </WithFooter>
        );
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
                        retry_btn,
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
                    extra={[retry_btn]}
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
                    extra={[retry_btn]}
                />
            </WithFooter>
        );
}

export default Root;
