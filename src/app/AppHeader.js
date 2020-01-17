import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Icon, Menu, Dropdown} from 'antd';

import {PoppableText} from '../widgets/PoppableText';
import {ClickableText} from '../widgets/ClickableText';
import {TimeStr} from '../widgets/TimeStr';

import {show_modal, do_refresh, get_token} from '../state/actions';

import './AppHeader.less';
import fire_bird_logo from '../fire_bird_bw.png';

export function AppHeader(props) {
    const dispatch=useDispatch();

    const loading=useSelector((state)=>state.local.loading);
    const user=useSelector((state)=>state.user);

    return (
        <div className="header-row">
            <div className="width-container">
                {!!user &&
                    <div className="pull-right">
                        <Dropdown trigger={['click']} overlay={<Menu>
                            <Menu.Item disabled={true}>
                                用户组：Ring {user.ring}
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item>
                                <a onClick={()=>{
                                    if(window.confirm('将会注销网页版 PKU Helper')) {
                                        delete localStorage['TOKEN'];
                                        dispatch(get_token());
                                    }
                                }}>
                                    <Icon type="logout" /> 注销 PKU Helper
                                </a>
                            </Menu.Item>
                        </Menu>}>
                            <ClickableText>
                                <Icon type="user" /> {user.name}
                            </ClickableText>
                        </Dropdown>
                    </div>
                }
                <PoppableText menu={[
                    {
                        children: (<span><Icon type="plus" /> 新建课程</span>),
                        onClick: ()=>dispatch(show_modal('add','zone',null)),
                    },
                    {
                        children: (<span><Icon type="appstore" /> 调整课程顺序</span>),
                        onClick: ()=>dispatch(show_modal('reorder','zone',null)),
                    },
                ]}>
                    <img src={fire_bird_logo} className="header-logo-img" alt="fire bird logo" />
                    <Icon type="more" /> 不咕计划
                </PoppableText>
                &nbsp;&nbsp;
                <ClickableText onClick={()=>dispatch(do_refresh(true))}>
                    <Icon type={{
                        'loading': 'loading',
                        'done': 'sync',
                        'error': 'exclamation-circle'
                    }[loading.status]} />
                    &nbsp;
                    {loading.status==='loading' ? '正在更新' :
                        <span>
                            <TimeStr time={loading.last_update_time} />
                            &nbsp;更新
                        </span>
                    }
                </ClickableText>
            </div>
        </div>
    );
}