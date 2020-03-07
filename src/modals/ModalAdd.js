import React, {useState, useEffect, useRef} from 'react';
import {useDispatch, useSelector, useStore} from 'react-redux';
import {Modal, Input, DatePicker, Popover, Select} from 'antd';

import {ItemBreadcrumb} from '../widgets/ItemBreadcrumb';
import {SharingHelp} from './modal_common';

import {magic_expand, MagicExpandHelp, magic_extend} from '../logic/magic_expand';
import {scope_name, prev_scope, moment_to_day} from '../functions';
import {do_interact, close_modal, show_modal_for_last_task} from '../state/actions';

import {PlusSquareOutlined, EditOutlined, QuestionCircleOutlined} from '@ant-design/icons';
import moment from 'moment';

const DOUBLE_ENTER_THRESHOLD_MS=250;
const DUE_DELTA_DAYS=[0,1,7,14];

function get_delta_days(ts_a,ts_b) {
    let t_a=moment_to_day(moment.unix(ts_a)), t_b=moment_to_day(moment.unix(ts_b));
    return t_b.diff(t_a,'days');
}

export function ModalAdd(props) {
    const dispatch=useDispatch();
    const store_getter=useStore();
    const modal=useSelector((state) => state.local.modal);

    const [names, set_names]=useState('');
    const [task_due_first, set_task_due_first]=useState(null);
    const [task_due_delta, set_task_due_delta]=useState(7);

    const disable_post_state=useRef(false);

    useEffect(() => {
        set_names('');
        set_task_due_first(null);
        set_task_due_delta(7);
        if(modal.visible && modal.type==='add') {
            disable_post_state.current=false;

            // magic extend
            if(modal.scope==='task') {
                let store=store_getter.getState();
                let subtasks_order=store.project[modal.itemid].task_order;
                if(subtasks_order.length===1) {
                    let res=magic_extend(store.task[subtasks_order[0]].name);
                    if(res)
                        set_names(res[1]);
                } else if(subtasks_order.length>=2) {
                    let last_task=store.task[subtasks_order[subtasks_order.length-1]];
                    let prelast_task=store.task[subtasks_order[subtasks_order.length-2]];
                    let res=magic_extend(last_task.name);
                    if(res && res[0]===prelast_task.name) {
                        set_names(res[1]);
                        if(prelast_task.due && last_task.due) {
                            let delta_due_days=get_delta_days(prelast_task.due,last_task.due);
                            if(DUE_DELTA_DAYS.indexOf(delta_due_days)!==-1)
                                set_task_due_first(moment.unix(last_task.due+delta_due_days*86400));
                        }
                    }
                }
            }
        }
    }, [modal]);

    function do_post(ns) {
        if(disable_post_state.current) return;

        let name_list=ns.split(/\n/).map((n) => n.trim()).filter((n) => n);
        if(name_list.length) {
            disable_post_state.current=true;

            dispatch(do_interact('add', modal.scope, {
                parent_id: modal.itemid,
                names: name_list,
                ...(modal.scope==='task' ? {
                    task_due_first: task_due_first ? task_due_first.unix() : null,
                    task_due_delta: task_due_delta,
                } : {}),
            }))
                .then((success)=>{
                    if(!success) {
                        disable_post_state.current=false;
                        return;
                    }

                    // disable_post_state is not recovered because this modal will be closed anyway
                    if(name_list.length===1)
                        dispatch(show_modal_for_last_task('update',modal.itemid,{from_modal_add: true}));
                    else
                        dispatch(close_modal());
                });
        }
    }

    const last_enter_ts=useRef(-DOUBLE_ENTER_THRESHOLD_MS);

    function on_press_enter(e) {
        let last_enter=last_enter_ts.current;
        last_enter_ts.current=(+new Date());
        let expanded_names=null;

        // press enter at the only line: do magic expand
        if(modal.scope==='task' && e.target.value.indexOf('\n')=== -1/* && e.target.selectionStart===e.target.value.length*/) {
            expanded_names=magic_expand(e.target.value);
            set_names(expanded_names);
        }

        // post when double enter or ctrl+enter
        if(e.ctrlKey || last_enter_ts.current-last_enter<DOUBLE_ENTER_THRESHOLD_MS) {
            if(expanded_names) // propagate new names manually because state hook is not updated yet
                do_post(expanded_names);
            else
                do_post(names);
        }
    }

    function on_keypress(e) {
        if(e.key.toLowerCase()!=='enter')
            last_enter_ts.current= -DOUBLE_ENTER_THRESHOLD_MS;
    }

    if(modal.type!=='add') return (<Modal visible={false} />);

    let is_multiple_names=(names.trim().indexOf('\n')!==-1);

    return (
        <Modal
            visible={modal.visible}
            title={<span><PlusSquareOutlined /> 新建{scope_name(modal.scope)}</span>}
            onCancel={() => dispatch(close_modal())}
            onOk={()=>do_post(names)}
            destroyOnClose={true}
        >
            {modal.scope!=='zone' &&
                <div>
                    <ItemBreadcrumb scope={prev_scope(modal.scope)} id={modal.itemid} suffix={<EditOutlined />} />
                    <br />
                    <br />
                </div>
            }
            <Input.TextArea
                value={names} onChange={(e) => set_names(e.target.value)} autoSize={true} key={modal.visible}
                autoFocus={true}
                onPressEnter={on_press_enter} onKeyPress={on_keypress}
                placeholder={scope_name(modal.scope)+'名称（每行一个）'}
            />
            <br />
            {modal.scope==='task' && (task_due_first || is_multiple_names) &&
                <div>
                    <br />
                    <DatePicker
                        onChange={(m) => set_task_due_first(m ? moment_to_day(m) : null)} value={task_due_first}
                        allowClear={true} placeholder="设置截止日期"
                        format="YYYY-MM-DD (ddd)"
                    />
                    {!!task_due_first && is_multiple_names &&
                        <span>
                            &nbsp;起每隔&nbsp;
                            <Select
                                value={task_due_delta}
                                onChange={(v) => set_task_due_delta(v)} min={0} max={999}
                                className="modal-add-delta-number-input"
                            >
                                {DUE_DELTA_DAYS.map((d)=>(
                                    <Select.Option key={d} value={d}>{d}天</Select.Option>
                                ))}
                            </Select>
                        </span>
                    }
                    <br />
                </div>
            }
            <br />
            <p>
                连按两次 ↵ 提交 &nbsp;
                {modal.scope==='project' &&
                    <Popover title="用户间分享" content={<SharingHelp />} trigger="click">
                        &nbsp;<a>输入分享ID来导入列表 <QuestionCircleOutlined /></a>
                    </Popover>
                }
                {modal.scope==='task' &&
                    <span>
                        &nbsp;
                        <Popover title="批量添加" content={<MagicExpandHelp />} trigger="click">
                            &nbsp;<a> 支持批量添加 <QuestionCircleOutlined /></a>
                        </Popover>
                    </span>
                }
            </p>
        </Modal>
    );
}