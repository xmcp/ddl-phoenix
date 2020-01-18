import React, {useState, useEffect, useMemo} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Modal, Input, Icon, Radio, Button, DatePicker, Checkbox} from 'antd';
import Reorder from 'react-reorder';
import moment from 'moment';

import {IconForColorType} from '../widgets/IconForColorType';
import {ItemBreadcrumb} from '../widgets/ItemBreadcrumb';

import {TIMEZONE, scope_name, colortype, prev_scope, moment_to_day, dflt} from '../functions';
import {close_modal, do_interact, do_update_settings} from '../state/actions';

import './Modals.less';

function close_modal_if_success(dispatch) {
    return (success)=>{
        if(success)
            dispatch(close_modal());
    };
}

function ModalAdd(props) {
    const dispatch=useDispatch();
    const modal=useSelector((state)=>state.local.modal);

    const [names,set_names]=useState('');

    useEffect(()=>{
        set_names('');
    },[modal]);

    function do_post() {
        let name_list=names.split(/\n/).map((n)=>n.trim()).filter((n)=>n);
        dispatch(do_interact('add',modal.scope,{
            parent_id: modal.itemid,
            names: name_list,
        }))
            .then(close_modal_if_success(dispatch));
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
                </div>
            }
            <Input.TextArea
                value={names} onChange={(e)=>set_names(e.target.value)} autoSize={true} key={modal.visible} autoFocus={true}
                onPressEnter={(e)=>{if(e.ctrlKey) do_post()}}
            />
            <p>//todo: 批量添加</p>
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
    const [status,set_status]=useState('');
    const [due,set_due]=useState(null);
    const due_moment=useMemo(()=>(
        due===null ? null : moment.unix(due).utcOffset(TIMEZONE)
    ),[due]);

    useEffect(()=>{ // on item update: restore name and status
        if(item===null) {
            if(modal.visible && modal.type==='update') // item not found: modal should be closed
                dispatch(close_modal());
        } else {
            set_name(item.name);
            set_delete_confirmed(false);
            set_status('active');
            set_due(item.due || null);
        }
    },[modal]);

    function do_post() {
        dispatch(do_interact('update',modal.scope,{
            id: modal.itemid,
            name: name,
            ... modal.scope==='task' ? {
                status: status,
                due: due,
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

    if(modal.type!=='update') return (<Modal visible={false} />);

    return (
        <Modal
            visible={modal.visible}
            title={<span><Icon type="edit" /> 编辑{scope_name(modal.scope)}</span>}
            onCancel={()=>dispatch(close_modal())}
            onOk={do_post}
            destroyOnClose={true}
        >
            <div>
                <Button type="danger" style={{width: '100px'}} onClick={do_delete}>
                    {delete_confirmed ? '确认删除' : <span><Icon type="delete" /> 删除</span>}
                </Button>
                &nbsp;
                <Input value={name} onChange={(e)=>set_name(e.target.value)} style={{width: 'calc(100% - 110px)'}} key={modal.visible} autoFocus={true} />
            </div>
            {modal.scope==='task' &&
                <div>
                    <br />
                    <Radio.Group value={status} onChange={(e)=>set_status(e.target.value)}>
                        <Radio.Button value="placeholder">
                            <IconForColorType type="placeholder" /> 占位
                        </Radio.Button>
                        <Radio.Button value="active">
                            <IconForColorType type="todo" /> 已布置
                        </Radio.Button>
                    </Radio.Group>
                    &nbsp;
                    <DatePicker value={due_moment} onChange={(m)=>set_due(m===null ? null : moment_to_day(m).unix())}
                                disabled={status==='placeholder'} placeholder="截止时间" />
                    <br />
                    <p>//todo: 更好的日期选择</p>
                </div>
            }
        </Modal>
    );
}

function ReorderListItem(props) {
    const colortype_cls=useSelector((state)=>(
        props.item.scope==='task' ? ('task-color-'+colortype(state.task[props.item.id])) : ''
    ));

    return (
        <div className={'reorder-list-item '+(colortype_cls)}>
            <ItemBreadcrumb scope={props.item.scope} id={props.item.id} />
        </div>
    );
}

function ModalReorder(props) {
    const dispatch=useDispatch();
    const modal=useSelector((state)=>state.local.modal);

    function make_object(ids) {
        return ids.map((id)=>({id: id, scope: modal.scope}));
    }

    const orig_list=useSelector((state)=>(
        modal.type==='reorder' ? make_object(
            modal.scope==='zone' ? state.zone_order :
            modal.scope==='project' ? state.zone[modal.itemid].project_order :
            modal.scope==='task' ? state.project[modal.itemid].task_order : null
        ) : null
    ));

    const [mod_list,set_mod_list]=useState([]);

    useEffect(()=>{
        set_mod_list(orig_list);
    },[modal]);

    function reorder_callback(event,item,index,newIndex,list) {
        set_mod_list(list);
    }

    function do_post() {
        dispatch(do_interact('reorder',modal.scope,{
            order: mod_list.map((({id})=>id)),
            parent_id: modal.itemid,
        }))
            .then(close_modal_if_success(dispatch));
    }

    if(modal.type!=='reorder') return (<Modal visible={false} />);

    return (
        <Modal
            visible={modal.visible}
            title={<span><Icon type="appstore" /> 调整{scope_name(modal.scope)}顺序</span>}
            onCancel={()=>dispatch(close_modal())}
            onOk={do_post}
            destroyOnClose={true}
        >
            {!!mod_list &&
                <Reorder
                    itemKey="id"
                    lock="horizontal"
                    holdTime={0}
                    list={mod_list}
                    template={ReorderListItem}
                    callback={reorder_callback}
                />
            }
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