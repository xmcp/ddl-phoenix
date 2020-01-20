import React, {useState} from 'react';
import {useDispatch} from 'react-redux';
import {Result, Input, Button} from 'antd';

import {do_register} from '../state/actions';
import {WithFooter} from '../app/Footer';
import {LoginPopup} from '../infrastructure/widgets';

import fire_bird_logo from '../fire_bird_bw.png';

export function WelcomePage(props) {
    const dispatch=useDispatch();
    const [regcode,set_regcode]=useState('');

    return (
        <WithFooter>
            <Result
                icon={<img src={fire_bird_logo} style={{height: '200px'}} alt="fire bird logo" />}
                title="欢迎加入「不咕计划」"
                subTitle="开源的在线 Deadline 管理工具"
            />
            <div className="center">
                <p>
                    <Input.Search
                        value={regcode} onChange={(e)=>set_regcode(e.target.value)} style={{width: '280px'}} autoFocus={true}
                        placeholder="内测期间需要填写邀请码" enterButton="注册" onSearch={()=>dispatch(do_register(regcode))}
                    />
                </p>
                <br />
            </div>
        </WithFooter>
    )
}

export function AskTokenPage(props) {
    return (
        <LoginPopup token_callback={props.on_got_token}>{(do_popup)=>(
            <WithFooter>
                <Result
                    status="info"
                    title="不咕计划"
                    subTitle="开源的在线 Deadline 管理工具"
                    extra={<Button type="primary" onClick={do_popup}>用 PKU Helper 账号登录</Button>}
                />
            </WithFooter>
        )}</LoginPopup>
    )
}