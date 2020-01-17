import React, {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Result, Button, Checkbox} from 'antd';

import {WithFooter} from '../app/Footer';

import {do_splash_callback} from '../state/actions';

function SplashAlphaTest(props) {
    const dispatch=useDispatch();

    const [agree,set_agree]=useState(false);

    function do_post() {
        dispatch(do_splash_callback(props.index,{agree: agree}));
    }

    return (
        <div className="width-container">
            <br />
            <h1>Alpha 测试用户须知</h1>
            <p>{props.handout.msg}</p>
            <hr />
            <p>本项目正在开发中，目前<b>对用户数据的可用性、完整性、保密性不做任何保证</b>。</p>
            <p>如果继续使用，<b>您在本项目的数据有可能丢失或泄漏</b>。没有人对此负任何责任。</p>
            <p>因此，在测试期间<b>请勿提交任何隐私或重要信息</b>。</p>
            <hr />
            <p>
                <Checkbox value={agree} onChange={(e)=>set_agree(e.target.checked)}>我同意</Checkbox>
                <Button type="primary" onClick={do_post}>继续</Button>
            </p>
        </div>
    );
}

export function SplashScreen(props) {
    const splash=useSelector((state)=>state.splash);

    if(splash.index===0)
        return (<SplashAlphaTest index={splash.index} handout={splash.handout} />);
    else
        return (
            <WithFooter>
                <Result
                    status="error"
                    title="无法显示页面"
                    subTitle={'未知 Splash Screen：'+splash.index}
                    extra={[
                        <Button onClick={()=>window.location.reload(true)}>刷新页面</Button>
                    ]}
                />
            </WithFooter>
        );
}