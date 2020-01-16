import React from 'react';

import {PoppableText} from '../widgets/PoppableText';
import {useDispatch, useSelector} from 'react-redux';
import {show_modal, do_refresh, get_token} from '../state/actions';
import {Icon, Menu, Dropdown} from 'antd';
import {ClickableText} from '../widgets/ClickableText';
import {TimeStr} from '../widgets/TimeStr';

import './AppHeader.less';

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
                                <a>
                                    <Icon type="setting" /> 设置 (TODO)
                                </a>
                            </Menu.Item>
                            <Menu.Item>
                                <a onClick={()=>{
                                    delete localStorage['TOKEN'];
                                    dispatch(get_token());
                                }}>
                                    <Icon type="logout" /> 注销 PKU Helper
                                </a>
                            </Menu.Item>
                        </Menu>}>
                            <ClickableText>
                                <Icon type="user" /> {user.name} <Icon type="caret-down" />
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
                    <Icon type="menu" /> 不咕计划
                </PoppableText>
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