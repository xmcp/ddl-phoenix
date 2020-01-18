import React, {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Result, Button, Checkbox} from 'antd';

import {WithFooter} from '../app/Footer';

import {do_splash_callback} from '../state/actions';

function SplashAnnounceChecker(props) {
    const dispatch=useDispatch();

    const [agree,set_agree]=useState(false);

    function do_post() {
        dispatch(do_splash_callback(props.index,{agree: agree}));
    }

    return (
        <div className="width-container">
            <br />
            <h1>{props.handout.title}</h1>
            <div dangerouslySetInnerHTML={{__html: props.handout.instruction_html}} />
            <hr />
            <div dangerouslySetInnerHTML={{__html: props.handout.content_html}} />
            <hr />
            <p>
                <Checkbox value={agree} onChange={(e)=>set_agree(e.target.checked)}>{props.handout.check}</Checkbox>
                <Button type="primary" onClick={do_post}>继续</Button>
            </p>
        </div>
    );
}

export function SplashScreen(props) {
    const splash=useSelector((state)=>state.splash);

    if(splash.type==='announce_checker')
        return (<SplashAnnounceChecker index={splash.index} handout={splash.handout} />);
    else
        return (
            <WithFooter>
                <Result
                    status="error"
                    title="无法显示页面"
                    subTitle={'未知 Splash Screen：'+splash.type+' (#'+splash.index+')'}
                    extra={[
                        <Button onClick={()=>window.location.reload(true)}>刷新页面</Button>
                    ]}
                />
            </WithFooter>
        );
}