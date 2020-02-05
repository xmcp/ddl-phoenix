import React, {useMemo, useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Modal, Icon} from 'antd';
import {ReactSortable} from "react-sortablejs";

import {close_modal_if_success} from './modal_common';
import {ItemBreadcrumb} from '../widgets/ItemBreadcrumb';

import {colortype, scope_name} from '../functions';
import {do_interact, close_modal} from '../state/actions';

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

    const [mod_list, set_mod_list]=useState(null); // null for unchanged

    useEffect(() => {
        set_mod_list(modal.args ? make_object(modal.args) : null);
    }, [modal]);

    function do_post() {
        let list=mod_list || orig_list;
        if(list) {
            dispatch(do_interact('reorder', modal.scope, {
                order: list.map((({id}) => id)),
                parent_id: modal.itemid,
            }))
                .then(close_modal_if_success(dispatch));
        }
    }

    if(modal.type!=='reorder') return (<Modal visible={false} />);

    return (
        <Modal
            visible={modal.visible}
            title={<span><Icon type="appstore" /> 调整{scope_name(modal.scope)}顺序</span>}
            onCancel={() => dispatch(close_modal())}
            onOk={do_post}
            destroyOnClose={true}
        >
            <div className="reorder-list-container">
                {!!orig_list &&
                    <ReactSortable
                        list={mod_list || orig_list} setList={set_mod_list}
                        ghostClass="reorder-list-ghost"
                        dragClass="hidden-for-drag"
                        animation={150}
                        delay={120}
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
                <Icon type="inbox" /> 没有{scope_name(modal.scope)}
            </p>
            }
        </Modal>
    )
}