import React, {useState, useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Modal, Icon, Input, DatePicker, InputNumber, Popover} from 'antd';

import {ItemBreadcrumb} from '../widgets/ItemBreadcrumb';
import {close_modal_if_success, SharingHelp} from './modal_common';

import {magic_expand, MagicExpandHelp} from '../logic/magic_expand';
import {scope_name, prev_scope, moment_to_day} from '../functions';
import {do_interact, close_modal} from '../state/actions';

const DOUBLE_ENTER_THRESHOLD_MS=250;

export function ModalAdd(props) {
    const dispatch=useDispatch();
    const modal=useSelector((state) => state.local.modal);

    const [names, set_names]=useState('');
    const [task_due_first, set_task_due_first]=useState(null);
    const [task_due_delta, set_task_due_delta]=useState(7);

    useEffect(() => {
        set_names('');
        set_task_due_first(null);
        set_task_due_delta(7);
    }, [modal]);

    function do_post() {
        let name_list=names.split(/\n/).map((n) => n.trim()).filter((n) => n);
        if(name_list.length)
            dispatch(do_interact('add', modal.scope, {
                parent_id: modal.itemid,
                names: name_list,
                ...(modal.scope==='task' ? {
                    task_due_first: task_due_first ? task_due_first.unix() : null,
                    task_due_delta: task_due_delta,
                } : {}),
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
        if(modal.scope==='task' && e.target.value.indexOf('\n')=== -1/* && e.target.selectionStart===e.target.value.length*/) {
            set_names(magic_expand(e.target.value));
        }
    }

    function on_keypress(e) {
        if(e.key.toLowerCase()!=='enter')
            last_enter_ts.current= -DOUBLE_ENTER_THRESHOLD_MS;
    }

    if(modal.type!=='add') return (<Modal visible={false} />);

    return (
        <Modal
            visible={modal.visible}
            title={<span><Icon type="plus-square" /> 新建{scope_name(modal.scope)}</span>}
            onCancel={() => dispatch(close_modal())}
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
                value={names} onChange={(e) => set_names(e.target.value)} autoSize={true} key={modal.visible}
                autoFocus={true}
                onPressEnter={on_press_enter} onKeyPress={on_keypress}
                placeholder={scope_name(modal.scope)+'名称（每行一个）'}
            />
            <br />
            {modal.scope==='task' &&
            <p>
                <br />
                <DatePicker
                    onChange={(m) => set_task_due_first(m ? moment_to_day(m) : null)} value={task_due_first}
                    allowClear={true} placeholder="设置截止日期"
                />
                {!!task_due_first && names.indexOf('\n')!== -1 &&
                <span>
                            &nbsp;起每隔&nbsp;
                    <InputNumber
                        value={task_due_delta} onChange={(v) => set_task_due_delta(v)} min={0} max={999}
                        className="modal-add-delta-number-input"
                        onPressEnter={do_post}
                    />
                    &nbsp;天
                        </span>
                }
                <br />
            </p>
            }
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
                    <Popover title="批量添加" content={<MagicExpandHelp />} trigger="click">
                            &nbsp;<a> 支持批量添加 <Icon type="question-circle" /></a>
                        </Popover>
                    </span>
                }
            </p>
        </Modal>
    )
}