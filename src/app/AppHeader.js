import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Menu, Dropdown} from 'antd';

import {PoppableText} from '../widgets/PoppableText';
import {ClickableText} from '../widgets/ClickableText';
import {TimeStr} from '../widgets/TimeStr';

import {
    show_modal,
    do_refresh,
    init_token,
    do_reset_splash_index,
    set_fancy_search
} from '../state/actions';

import './AppHeader.less';
import fire_bird_logo from '../fire_bird_bw.png';
import {
    SettingOutlined,
    UserOutlined,
    PlusOutlined,
    AppstoreOutlined,
    MoreOutlined,
    LoadingOutlined,
    SyncOutlined,
    ExclamationCircleOutlined,
    LogoutOutlined,
    UndoOutlined,
    SearchOutlined,
    CloudUploadOutlined
} from '@ant-design/icons';

export function HEADER_MENU(dispatch) {
    return [
        {
            children: (<span><PlusOutlined /> 新建课程</span>),
            onClick: ()=>dispatch(show_modal('add','zone',null)),
        },
        {
            children: (<span><AppstoreOutlined /> 整理课程</span>),
            onClick: ()=>dispatch(show_modal('reorder','zone',null)),
        },
    ];
}

export function AppHeader(props) {
    const dispatch=useDispatch();

    const loading=useSelector((state)=>state.local.loading);
    const user=useSelector((state)=>state.user);
    const slim=useSelector((state)=>state.local.is_slim);

    return (
        <div className="header-row">
            <div className="width-container">
                {!!user &&
                    <div className="pull-right">
                        <Dropdown trigger={['click']} className="header-highlight" overlay={<Menu>
                            <Menu.Item disabled={true}>
                                当前用户：{user.name}
                            </Menu.Item>
                            <Menu.Item disabled={true}>
                                用户组：Ring {user.ring}
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item>
                                <a onClick={()=>dispatch(show_modal('settings',null,null))}>
                                    <SettingOutlined /> 设置
                                </a>
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item>
                                <a onClick={()=>dispatch(do_reset_splash_index())}>
                                    <UndoOutlined /> 重新显示欢迎页面
                                </a>
                            </Menu.Item>
                            <Menu.Item>
                                <a onClick={()=>{
                                    if(window.confirm('将会注销网页版 PKU Helper')) {
                                        delete localStorage['TOKEN'];
                                        dispatch(init_token());
                                    }
                                }}>
                                    <LogoutOutlined /> 注销 PKU Helper
                                </a>
                            </Menu.Item>
                        </Menu>}>
                            <ClickableText>
                                &nbsp; <UserOutlined /> &nbsp;
                            </ClickableText>
                        </Dropdown>
                    </div>
                }
                {slim ?
                    <ClickableText onClick={null}>
                        <img src={fire_bird_logo} className="header-logo-img" alt="fire bird logo" />
                        <span className="l-only">不咕计划</span>
                    </ClickableText> :
                    <PoppableText className="header-highlight" menu={HEADER_MENU(dispatch)}>
                        <img src={fire_bird_logo} className="header-logo-img" alt="fire bird logo" />
                        <span className="no-xs">
                            <MoreOutlined />
                            <span className="l-only"> 不咕计划</span>
                        </span>
                    </PoppableText>
                }
                &nbsp;
                <ClickableText onClick={()=>dispatch(set_fancy_search('set',''))} className="header-highlight">
                    <SearchOutlined />
                    &nbsp;转到
                </ClickableText>
                &nbsp;
                <ClickableText key={+loading.last_update_time} onClick={()=>dispatch(do_refresh())} className="header-highlight">
                    {{
                        loading: <LoadingOutlined />,
                        updating: <CloudUploadOutlined />,
                        done: <SyncOutlined className="header-refresh-icon" />,
                        error: <ExclamationCircleOutlined className="header-refresh-icon" />,
                    }[loading.status]}
                    &nbsp;
                    {loading.status==='loading' ? '正在更新' : (loading.status==='updating' ? '正在上传' :
                        <span>
                            <TimeStr time={loading.last_update_time} />
                            <span className="l-only">&nbsp;更新</span>
                        </span>
                    )}
                </ClickableText>
            </div>
        </div>
    );
}