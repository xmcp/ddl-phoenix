import React, {useMemo, useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Modal, Menu, Table} from 'antd';
import {ReactSortable} from "react-sortablejs";

import {close_modal_if_success} from './modal_common';
import {ItemBreadcrumb} from '../widgets/ItemBreadcrumb';

import {colortype, scope_name} from '../functions';
import {do_interact, close_modal} from '../state/actions';

import {AppstoreOutlined, SwapOutlined, DeleteOutlined, InboxOutlined} from '@ant-design/icons';

function ReorderListItem(props) {
    const colortype_cls=useSelector((state) => (
        props.item.scope==='task' ? ('task-color-'+colortype(state.task[props.item.id])) : ''
    ));

    return useMemo(() => (
        <div className={'reorder-list-item '+(colortype_cls)}>
            <ItemBreadcrumb scope={props.item.scope} id={props.item.id} />
        </div>
    ), [props.item.scope, props.item.id, colortype_cls]);
}

function DeleteListItem(props) {
    const colortype_cls=useSelector((state) => (
        props.item.scope==='task' ? ('task-color-'+colortype(state.task[props.item.id])) : ''
    ));

    return useMemo(() => (
        <div className={'delete-list-item '+(colortype_cls)}>
            <ItemBreadcrumb scope={props.item.scope} id={props.item.id} />
        </div>
    ), [props.item.scope, props.item.id, colortype_cls]);
}

export function ModalReorder(props) {
    const dispatch=useDispatch();
    const modal=useSelector((state) => state.local.modal);

    function make_object(ids) {
        return ids.map((id) => ({id: id, scope: modal.scope}));
    }

    const orig_list=useSelector((state) => {
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

    const [tab,set_tab]=useState('reorder');

    const [mod_list, set_mod_list]=useState(null); // null for unchanged
    const [del_ids,set_del_ids]=useState([]);

    useEffect(() => {
        set_tab('reorder');
    },[modal]);

    useEffect(() => {
        set_mod_list(modal.args ? make_object(modal.args) : null);
        set_del_ids([]);
    }, [modal,tab]);

    function do_post() {
        if(tab==='reorder') {
            let list=mod_list || orig_list;
            if(list) {
                dispatch(do_interact('reorder', modal.scope, {
                    order: list.map((({id}) => id)),
                    parent_id: modal.itemid,
                }))
                    .then(close_modal_if_success(dispatch));
            }
        } else if(tab==='delete') {
            dispatch(do_interact('delete', modal.scope, {
                ids: del_ids,
                parent_id: modal.itemid,
            }))
                .then(close_modal_if_success(dispatch));
        }
    }

    if(modal.type!=='reorder') return (<Modal visible={false} />);

    return (
        <Modal
            visible={modal.visible}
            title={<span><AppstoreOutlined /> 整理{scope_name(modal.scope)}</span>}
            onCancel={() => dispatch(close_modal())}
            onOk={do_post}
            destroyOnClose={true}
            bodyStyle={{
                paddingTop: '.5em',
            }}
            okType={tab==='delete' ? 'danger' : 'primary'}
        >
            <Menu selectedKeys={[tab]} onClick={(e)=>set_tab(e.key)}  mode="horizontal">
                <Menu.Item key="reorder">
                    <SwapOutlined /> &nbsp;
                    调整顺序
                </Menu.Item>
                <Menu.Item key="delete">
                    <DeleteOutlined /> &nbsp;
                    批量删除
                </Menu.Item>
            </Menu>
            <br />
            {tab==='reorder' &&
                <div>
                    <div className="reorder-list-container">
                        {!!orig_list &&
                            <ReactSortable
                                list={mod_list || orig_list} setList={set_mod_list}
                                ghostClass="reorder-list-ghost"
                                dragClass="hidden-for-drag"
                                animation={0}
                                delay={100}
                                delayOnTouchOnly={true}
                            >
                                {(mod_list || orig_list).map((item)=>(
                                    <ReorderListItem key={item.id} item={item} />
                                ))}
                            </ReactSortable>
                        }
                    </div>
                    {!!orig_list && orig_list.length===0 &&
                        <p>
                            <InboxOutlined /> 没有{scope_name(modal.scope)}
                        </p>
                    }
                </div>
            }
            {tab==='delete' &&
                <div>
                    <Table
                        columns={[
                            {
                                title: del_ids.length ? ('已选择 '+del_ids.length+' 个'+scope_name(modal.scope)) : '',
                                dataIndex: 'id',
                                render: (text,record)=>(
                                    <DeleteListItem item={record} />
                                ),
                            }
                        ]}
                        dataSource={orig_list}
                        pagination={false}
                        size="small"
                        rowSelection={{
                            selectedRowKeys: del_ids,
                            onChange: set_del_ids,
                            hideDefaultSelections: true,
                            selections: [
                                {
                                    key: 'all',
                                    text: '全选',
                                    onSelect: ()=>{
                                        set_del_ids(orig_list.map(({id})=>id));
                                    },
                                },
                                {
                                    key: 'invert',
                                    text: '反选',
                                    onSelect: ()=>{
                                        set_del_ids(orig_list.map(({id})=>id).filter((id)=>del_ids.indexOf(id)===-1));
                                    },
                                },
                                {
                                    key: 'none',
                                    text: '清除',
                                    onSelect: ()=>{
                                        set_del_ids([]);
                                    },
                                },
                            ],
                        }}
                        rowKey="id"
                        onRow={(record)=>({
                            onClick: ()=>{
                                let new_del_ids=del_ids.slice();
                                console.log(record);

                                let idx=new_del_ids.indexOf(record.id);
                                if(idx===-1)
                                    new_del_ids.push(record.id);
                                else
                                    new_del_ids.splice(idx,1);

                                set_del_ids(new_del_ids);
                            },
                        })}
                    />
                </div>
            }
        </Modal>
    );
}