import React, {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Result, Button, Checkbox, Radio} from 'antd';

import {WithFooter} from '../app/Footer';

import {do_splash_callback} from '../state/actions';

import './SplashScreen.less';
import {RobotOutlined} from '@ant-design/icons';

function SplashAnnounceChecker(props) {
    const dispatch=useDispatch();

    const [agree,set_agree]=useState(false);

    function do_post() {
        dispatch(do_splash_callback(props.index,{agree: agree}));
    }

    return (
        <WithFooter no_classname={true}>
            <div className="width-container">
                <div style={{padding: '0 .5em'}}>
                    <div className="splash-body-container">
                        <h1>{props.handout.title}</h1>
                        {!!props.handout.instruction_html &&
                            <div dangerouslySetInnerHTML={{__html: props.handout.instruction_html}} />
                        }
                        <hr />
                        <div dangerouslySetInnerHTML={{__html: props.handout.content_html}} />
                        <hr />
                    </div>
                    <p>
                        <Checkbox value={agree} onChange={(e)=>set_agree(e.target.checked)}>{props.handout.check}</Checkbox>
                        <Button type="primary" onClick={do_post}>继续</Button>
                    </p>
                </div>
            </div>
        </WithFooter>
    );
}

function SplashAnnounce(props) {
    const dispatch=useDispatch();

    function do_post() {
        dispatch(do_splash_callback(props.index,{}));
    }

    return (
        <WithFooter no_classname={true}>
            <div className="width-container">
                <div style={{padding: '0 .5em'}}>
                    <div className="splash-body-container">
                        <h1>{props.handout.title}</h1>
                        {!!props.handout.instruction_html &&
                            <div dangerouslySetInnerHTML={{__html: props.handout.instruction_html}} />
                        }
                        <hr />
                        <div dangerouslySetInnerHTML={{__html: props.handout.content_html}} />
                        <hr />
                    </div>
                    <p>
                        <Button type="primary" onClick={do_post}>继续</Button>
                    </p>
                </div>
            </div>
        </WithFooter>
    );
}

function SplashSelectSingle(props) {
    const dispatch=useDispatch();
    const [selection,set_selection]=useState(props.handout.default_selection);

    function do_post() {
        dispatch(do_splash_callback(props.index,{selection: selection}));
    }

    return (
        <WithFooter no_classname={true}>
            <div className="width-container">
                <div style={{padding: '0 .5em'}}>
                    <div className="splash-body-container">
                        <h1>{props.handout.title}</h1>
                        {!!props.handout.instruction_html &&
                        <div dangerouslySetInnerHTML={{__html: props.handout.instruction_html}} />
                        }
                        <hr />
                        <div dangerouslySetInnerHTML={{__html: props.handout.content_html}} />
                        <Radio.Group value={selection} onChange={(e)=>set_selection(e.target.value)}>
                            {props.handout.selection.map(([value,text])=>(
                                <Radio key={value} value={value} className="splash-boxify">{text}</Radio>
                            ))}
                        </Radio.Group>
                    </div>
                    <p>
                        <Button type="primary" onClick={do_post}>继续</Button>
                    </p>
                </div>
            </div>
        </WithFooter>
    );
}

function SplashSelectMultiple(props) {
    const dispatch=useDispatch();
    const [selection,set_selection]=useState(props.handout.default_selection||[]);

    function do_post() {
        dispatch(do_splash_callback(props.index,{selection: selection}));
    }

    return (
        <WithFooter no_classname={true}>
            <div className="width-container">
                <div style={{padding: '0 .5em'}}>
                    <div className="splash-body-container">
                        <h1>{props.handout.title}</h1>
                        {!!props.handout.instruction_html &&
                            <div dangerouslySetInnerHTML={{__html: props.handout.instruction_html}} />
                        }
                        <hr />
                        <div dangerouslySetInnerHTML={{__html: props.handout.content_html}} />
                        <Checkbox.Group value={selection} onChange={set_selection}>
                            {props.handout.selection.map(([value,text])=>(
                                <Checkbox key={value} value={value} className="splash-boxify">{text}</Checkbox>
                            ))}
                        </Checkbox.Group>
                    </div>
                    <p>
                        <Button type="primary" onClick={do_post}>继续</Button>
                    </p>
                </div>
            </div>
        </WithFooter>
    );
}


export function SplashScreen(props) {
    const splash=useSelector((state)=>state.splash);

    if(splash.type==='announce_checker')
        return (<SplashAnnounceChecker index={splash.index} handout={splash.handout} />);
    else if(splash.type==='announce')
        return (<SplashAnnounce index={splash.index} handout={splash.handout} />);
    else if(splash.type==='select_single')
        return (<SplashSelectSingle index={splash.index} handout={splash.handout} />);
    else if(splash.type==='select_multiple')
        return (<SplashSelectMultiple index={splash.index} handout={splash.handout} />);
    else
        return (
            <WithFooter>
                <Result
                    icon={<RobotOutlined />}
                    status="error"
                    title="无法显示页面"
                    subTitle={'不支持 '+splash.name+' (#'+splash.index+', '+splash.type+')'}
                    extra={[
                        <Button onClick={()=>window.location.reload(true)}>刷新页面</Button>
                    ]}
                />
            </WithFooter>
        );
}