import React, {useState, useEffect, useMemo, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Modal, Input, Icon, Radio, Button, Checkbox, Calendar, Row, Col, Popover} from 'antd';
import Reorder from 'react-reorder';
import moment from 'moment';

import {IconForColorType} from '../widgets/IconForColorType';
import {ItemBreadcrumb} from '../widgets/ItemBreadcrumb';

import {scope_name, colortype, prev_scope, moment_to_day, dflt, friendly_date} from '../functions';
import {init_quicktype, proc_input, set_moment, is_quicktype_char, QuicktypeHelp} from '../logic/date_quicktype';
import {magic_expand, MagicExpandHelp} from '../logic/magic_expand';
import {close_modal, do_interact, do_update_settings} from '../state/actions';

import './Modals.less';

const DOUBLE_ENTER_THRESHOLD_MS=250;

function close_modal_if_success(dispatch) {
    return (success)=>{
        if(success)
            dispatch(close_modal());
    };
}

function SharingHelp(props) {
    return (
        <div>
            <p>分享给他人：</p>
            <ul>
                <li>在 “编辑类别” 对话框中勾选 “分享给其他用户”。</li>
                <li>保存后，在类别的下拉菜单中点击 “复制分享ID” 并发送给别人。</li>
                <li><b style={{color: 'red'}}>如果你取消勾选 “分享给其他用户”，分享ID将失效，但已经导入的用户仍能继续使用。</b></li>
                <li><b style={{color: 'red'}}>如果你取消分享后删除这个类别，已经导入的用户仍能继续使用，但没有人能编辑。</b></li>
            </ul>
            <p>导入他人的分享：</p>
            <ul>
                <li>在 “添加类别” 对话框中输入分享ID。</li>
                <li>你将看到对方分享的内容，你可以标记自己的完成状态，但不能进行其他编辑。</li>
                <li>如果你删除这个类别，将不会影响到别人。</li>
            </ul>
        </div>
    );
}

function ModalAdd(props) {
    const dispatch=useDispatch();
    const modal=useSelector((state)=>state.local.modal);

    const [names,set_names]=useState('');
    const [add_as_active,set_add_as_active]=useState(false);

    useEffect(()=>{
        set_names('');
        set_add_as_active(false);
    },[modal]);

    function do_post() {
        let name_list=names.split(/\n/).map((n)=>n.trim()).filter((n)=>n);
        if(name_list.length)
            dispatch(do_interact('add',modal.scope,{
                parent_id: modal.itemid,
                names: name_list,
                ... modal.scope==='task' ? {
                    active: add_as_active,
                } : {},
            }))
                .then(close_modal_if_success(dispatch));
    }

    const last_enter_ts=useRef(-DOUBLE_ENTER_THRESHOLD_MS);

    function on_press_enter(e) {
        let last_enter=last_enter_ts.current;
        last_enter_ts.current=(+new Date());
        if(e.ctrlKey || last_enter_ts.current-last_enter<DOUBLE_ENTER_THRESHOLD_MS)
            do_post();

        // press enter at the only line: do magic expand
        if(modal.scope==='task' && e.target.value.indexOf('\n')===-1/* && e.target.selectionStart===e.target.value.length*/) {
            set_names(magic_expand(e.target.value));
        }
    }
    function on_keypress(e) {
        if(e.key.toLowerCase()!=='enter')
            last_enter_ts.current=-DOUBLE_ENTER_THRESHOLD_MS;
    }

    if(modal.type!=='add') return (<Modal visible={false} />);

    return (
        <Modal
            visible={modal.visible}
            title={<span><Icon type="plus-square" /> 新建{scope_name(modal.scope)}</span>}
            onCancel={()=>dispatch(close_modal())}
            onOk={do_post}
            destroyOnClose={true}
        >
            {modal.scope!=='zone' &&
                <div>
                    <ItemBreadcrumb scope={prev_scope(modal.scope)} id={modal.itemid} suffix={<Icon type="edit" />} />
                    <br />
                    <br />
                </div>
            }
            <Input.TextArea
                value={names} onChange={(e)=>set_names(e.target.value)} autoSize={true} key={modal.visible} autoFocus={true}
                onPressEnter={on_press_enter} onKeyPress={on_keypress}
            />
            <br />
            <br />
            <p>
                连按两次 ↵ 提交 &nbsp;
                {modal.scope==='project' &&
                    <Popover title="用户间分享" content={<SharingHelp />} trigger="click">
                        &nbsp;<a>输入分享ID来导入列表 <Icon type="question-circle" /></a>
                    </Popover>
                }
                {modal.scope==='task' &&
                    <span>
                        &nbsp;
                        <Checkbox checked={add_as_active} onChange={(e)=>set_add_as_active(e.target.checked)}>
                            设为已布置
                        </Checkbox>
                        <Popover title="批量添加" content={<MagicExpandHelp />} trigger="click">
                            &nbsp;<a> 批量添加 <Icon type="question-circle" /></a>
                        </Popover>
                    </span>
                }
            </p>
        </Modal>
    )
}

function ModalUpdate(props) {
    const dispatch=useDispatch();
    const modal=useSelector((state)=>state.local.modal);
    const item=useSelector((state)=>(
        modal.type==='update' ? state[modal.scope][modal.itemid]||null : null
    ));

    const [name,set_name]=useState('');
    const [delete_confirmed,set_delete_confirmed]=useState(false);
    const [shared,set_shared]=useState(false);
    const [status,set_status]=useState('');
    const [due_quicktype,set_due_quicktype]=useState(init_quicktype(null));

    const quicktype_ref=useRef(null);

    useEffect(()=>{ // on item update: restore name and status
        if(item===null) {
            if(modal.visible && modal.type==='update') // item not found: modal should be closed
                dispatch(close_modal());
        } else {
            set_name(item.name);
            set_delete_confirmed(false);
            set_shared(!!item.share_hash);
            set_status('active');
            set_due_quicktype(init_quicktype(item.due || null));
        }
    },[modal]);

    function do_post() {
        dispatch(do_interact('update',modal.scope,{
            id: modal.itemid,
            name: name,
            ... modal.scope==='task' ? {
                status: status,
                due: due_quicktype.moment===null ? null : due_quicktype.moment.unix(),
            } : {},
            ... modal.scope==='project' ? {
                shared: shared,
            } : {},
        }))
            .then(close_modal_if_success(dispatch));
    }

    function do_delete() {
        if(delete_confirmed)
            dispatch(do_interact('delete',modal.scope,{
                id: modal.itemid,
                parent_id: item.parent_id,
            }))
                .then(close_modal_if_success(dispatch));
        else
            set_delete_confirmed(true);
    }

    function on_select_date(date,_mode) {
        set_due_quicktype(set_moment(date));
    }

    function calendar_header_render({value, type, onChange, onTypeChange}) {
        return (
            <div style={{textAlign: 'center'}}>
                <Button type="link" onClick={()=>onChange(value.clone().add(-1,'month'))}>
                    <Icon type="backward" />
                </Button>
                <Button type="link" onClick={()=>onChange(moment_to_day(moment()))}>
                    {value.year()}年 {value.month()+1}月
                </Button>
                <Button type="link" onClick={()=>onChange(value.clone().add(+1,'month'))}>
                    <Icon type="forward" />
                </Button>
            </div>
        );
    }

    // handle keyboard event
    useEffect(()=>{
        if(modal.type!=='update' || !modal.visible) return;

        function handler(e) {
            // skip if we are in other inputs
            if(['input','textarea'].indexOf(e.target.tagName.toLowerCase())!==-1 && !e.target.closest('.modal-update-quicktype-input'))
                return;
            if(e.ctrlKey || e.altKey || e.metaKey)
                return;

            if(is_quicktype_char(e.key)) {
                console.log('got quicktype event',e);
                set_due_quicktype(proc_input(due_quicktype,e.key.toLowerCase()==='backspace' ? '\b' : e.key.toLowerCase()));
                if(quicktype_ref.current)
                    quicktype_ref.current.focus();
            } else if(e.key.toLowerCase()==='enter')
                do_post();
        }

        document.addEventListener('keydown',handler);
        return ()=>{
            document.removeEventListener('keydown',handler);
        }
    },[modal,due_quicktype]);

    if(modal.type!=='update') return (<Modal visible={false} />);

    return (
        <Modal
            visible={modal.visible}
            title={<span><Icon type="edit" /> 编辑{scope_name(modal.scope)}</span>}
            width={modal.scope==='task' ? 700 : undefined}
            centered={modal.scope==='task' && window.innerHeight<=750}
            onCancel={()=>dispatch(close_modal())}
            onOk={do_post}
            destroyOnClose={true}
        >
            <div>
                <Button type="danger" className="modal-btnpair-btn" onClick={do_delete} disabled={shared}>
                    {delete_confirmed ? '确认删除' : <span><Icon type="delete" /> 删除</span>}
                </Button>
                <Input className="modal-btnpair-input" value={name} onChange={(e)=>set_name(e.target.value)} key={modal.visible}
                       autoFocus={modal.scope!=='task'} onPressEnter={do_post} />
            </div>
            {modal.scope==='project' && !item.external &&
                <p>
                    <br />
                    <Checkbox checked={shared} onChange={(e)=>set_shared(e.target.checked)}>分享给其他用户</Checkbox>
                    <Popover title="用户间分享" content={<SharingHelp />} trigger="click" placement="bottom">
                        <a><Icon type="question-circle" /></a>
                    </Popover>
                </p>
            }
            {modal.scope==='task' && <br />}
            {modal.scope==='task' &&
                <Row gutter={6}>
                    <Col xs={24} md={12}>
                        <Radio.Group value={status} onChange={(e)=>set_status(e.target.value)}>
                            <Radio.Button value="placeholder">
                                <IconForColorType type="placeholder" /> 占位
                            </Radio.Button>
                            <Radio.Button value="active">
                                <IconForColorType type="todo" />&nbsp;
                                {due_quicktype.moment===null ? '无截止日期' : friendly_date(due_quicktype.moment.unix(),false)}
                            </Radio.Button>
                        </Radio.Group>
                        &nbsp;
                        {status==='active' && due_quicktype.moment!==null &&
                            <Button onClick={()=>{set_due_quicktype(set_moment(null))}}>
                                <Icon type="close-circle" />
                            </Button>
                        }
                        {status==='active' &&
                            <div>
                                <br />
                                <p>
                                    <Input
                                        value="" className="modal-update-quicktype-input" disabled={true}
                                        prefix={
                                            <span>
                                                <Icon type="code" /> &nbsp;{due_quicktype.buffer || due_quicktype.placeholder}
                                            </span>
                                        }
                                        suffix={
                                            <Popover title="日期输入方式" content={<QuicktypeHelp />} placement="bottom" trigger="click" className="quicktype-help-btn">
                                                <Icon type="question-circle" />
                                            </Popover>
                                        }
                                    />
                                </p>
                                <br />
                            </div>
                        }
                    </Col>
                    <Col xs={24} md={12}>
                        {status==='active' &&
                            <Calendar
                                value={due_quicktype.moment===null ? moment_to_day(moment()) : due_quicktype.moment} onChange={on_select_date}
                                fullscreen={false} headerRender={calendar_header_render} className="custom-ant-calender"
                            />
                        }
                    </Col>
                </Row>
            }
        </Modal>
    );
}

function ReorderListItem(props) {
    const colortype_cls=useSelector((state)=>(
        props.item.scope==='task' ? ('task-color-'+colortype(state.task[props.item.id])) : ''
    ));

    return useMemo(()=>(
        <div className={'reorder-list-item '+(colortype_cls)}>
            <ItemBreadcrumb scope={props.item.scope} id={props.item.id} />
        </div>
    ),[props.item.scope,props.item.id]);
}

function ModalReorder(props) {
    const dispatch=useDispatch();
    const modal=useSelector((state)=>state.local.modal);

    function make_object(ids) {
        return ids.map((id)=>({id: id, scope: modal.scope}));
    }

    const orig_list=useSelector((state)=> {
        try {
            return modal.type==='reorder' ? make_object(
                modal.scope==='zone' ? state.zone_order :
                modal.scope==='project' ? state.zone[modal.itemid].project_order :
                modal.scope==='task' ? state.project[modal.itemid].task_order : null
            ) : null
        } catch(e) {
            console.error('modal reorder key error');
            console.trace(e);
            return null;
        }
    });

    const [mod_list,set_mod_list]=useState([]);

    useEffect(()=>{
        set_mod_list(orig_list);
    },[modal]);

    function reorder_callback(event,item,index,newIndex,list) {
        set_mod_list(list);
    }

    function do_post() {
        if(mod_list) {
            dispatch(do_interact('reorder',modal.scope,{
                order: mod_list.map((({id})=>id)),
                parent_id: modal.itemid,
            }))
                .then(close_modal_if_success(dispatch));
        }
    }

    if(modal.type!=='reorder') return (<Modal visible={false} />);

    return (
        <Modal
            visible={modal.visible}
            title={<span><Icon type="appstore" /> 调整{scope_name(modal.scope)}顺序 <small style={{opacity: .6}}> 按住并拖动</small></span>}
            onCancel={()=>dispatch(close_modal())}
            onOk={do_post}
            destroyOnClose={true}
        >
            <div className="reorder-list-container">
                {!!mod_list &&
                    <Reorder
                        itemKey="id"
                        lock="horizontal"
                        holdTime={100}
                        list={mod_list}
                        template={ReorderListItem}
                        callback={reorder_callback}
                    />
                }
            </div>
            {!!mod_list && mod_list.length===0 &&
                <p>
                    <Icon type="inbox" /> 没有{scope_name(modal.scope)}
                </p>
            }
        </Modal>
    )
}

function ModalSettings(props) {
    const dispatch=useDispatch();
    const modal=useSelector((state)=>state.local.modal);
    const settings=useSelector((state)=>state.user.settings);

    const [no_hover,set_no_hover]=useState(false);

    useEffect(()=>{
        set_no_hover(dflt(settings.no_hover,false));
    },[modal]);

    if(modal.type!=='settings') return (<Modal visible={false} />);

    function do_post() {
        dispatch(do_update_settings({
            no_hover: no_hover,
        }))
            .then(close_modal_if_success(dispatch));
    }

    return (
        <Modal
            visible={modal.visible}
            title={<span><Icon type="setting" /> 设置</span>}
            onCancel={()=>dispatch(close_modal())}
            onOk={do_post}
            destroyOnClose={true}
        >
            <p><Checkbox checked={no_hover} onChange={(e)=>set_no_hover(e.target.checked)}>
                用点击替代鼠标悬浮效果
            </Checkbox></p>
        </Modal>
    );
}

export function Modals(props) {
    return [
        <ModalAdd key="add" />,
        <ModalUpdate key="update" />,
        <ModalReorder key="reorder" />,
        <ModalSettings key="settings" />,
    ];
}