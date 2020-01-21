import React, {useState} from 'react';
import {useDispatch} from 'react-redux';
import {Result, Input, Button} from 'antd';

import {do_register} from '../state/actions';
import {WithFooter} from '../app/Footer';

import fire_bird_logo from '../fire_bird_bw.png';

export function WelcomePageExample(props) {
    const dispatch=useDispatch();
    const [regcode,set_regcode]=useState('');

    return (
        <WithFooter>
            <Result
                icon={<img src={fire_bird_logo} style={{height: '200px'}} alt="fire bird logo" />}
                title="不咕计划"
                subTitle="开源的在线 Deadline 管理工具"
            />
            <div className="center">
                <p>在这里接入邀请注册系统</p>
                <p>
                    <Input.Search
                        value={regcode} onChange={(e)=>set_regcode(e.target.value)} style={{width: '280px'}} autoFocus={true}
                        placeholder="邀请码" enterButton="注册" onSearch={()=>dispatch(do_register(regcode))}
                    />
                </p>
                <br />
            </div>
        </WithFooter>
    )
}

export function AskTokenPage(props) {
    return (
        <WithFooter>
            <Result
                status="info"
                title="不咕计划"
                subTitle="开源的在线 Deadline 管理工具"
                extra={<Button type="primary" onClick={()=>{
                    let token=prompt('input token');
                    if(token)
                        props.on_got_token(token);
                }}>在这里接入用户系统</Button>}
            />
        </WithFooter>
    )
}