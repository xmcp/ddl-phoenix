import React, {useState, useEffect, useMemo} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Modal, Input, Icon, Radio, Button, DatePicker} from 'antd';
import moment from 'moment';

import {close_modal, do_interact} from '../state/actions';
import {scope_name} from '../functions';
import {IconForColorType} from '../widgets/IconForColorType';

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
        let name_list=names.split(/\n/).map((n)=>n.trim());
        dispatch(do_interact('add',modal.scope,{
            parent_id: modal.itemid,
            names: name_list,
        }))
            .then(close_modal_if_success(dispatch));
    }

    return (
        <Modal
            visible={modal.type==='add'}
            title={<span><Icon type="plus-square" /> 新建{scope_name(modal.scope)}</span>}
            onCancel={()=>dispatch(close_modal())}
            onOk={do_post}
        >
            <p>itemid: {modal.itemid}</p>
            <p>names: </p>
            <Input.TextArea value={names} onChange={(e)=>set_names(e.target.value)} autoSize={true} />
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
        due===null ? null : moment.unix(due)
    ),[due]);

    useEffect(()=>{ // on item update: restore name and status
        if(item===null) {
            if(modal.type==='update') // item not found: modal should be closed
                dispatch(close_modal());
        } else {
            set_name(item.name);
            set_delete_confirmed(false);
            set_status('active');
            if(item.due)
                set_due(item.due);
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

    return (
        <Modal
            visible={modal.type==='update'}
            title={<span><Icon type="edit" /> 编辑{scope_name(modal.scope)}</span>}
            onCancel={()=>dispatch(close_modal())}
            onOk={do_post}
        >
            <p>itemid: {modal.itemid}</p>
            <div>
                <Button type="danger" style={{width: '100px', marginRight: '5px'}} onClick={do_delete}>
                    {delete_confirmed ? '确认删除' : <span><Icon type="delete" /> 删除</span>}
                </Button>
                <Input value={name} onChange={(e)=>set_name(e.target.value)} style={{width: 'calc(100% - 110px)'}} />
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
                    <DatePicker value={due_moment} onChange={(m)=>set_due(m===null ? null : m.unix())} disabled={status==='placeholder'} />
                </div>
            }
        </Modal>
    );
}

function ModalReorder(props) {
    const dispatch=useDispatch();
    const modal=useSelector((state)=>state.local.modal);

    function do_post() {
    }

    return (
        <Modal
            visible={modal.type==='reorder'}
            title={<span><Icon type="appstore" /> 调整{scope_name(modal.scope)}顺序</span>}
            onCancel={()=>dispatch(close_modal())}
            onOk={do_post}
        >
            <p>itemid: {modal.itemid}</p>
            <p>todo</p>
        </Modal>
    )
}

export function Modals(props) {
    return [
        <ModalAdd key="add" />,
        <ModalUpdate key="update" />,
        <ModalReorder key="reorder" />,
    ];
}