import React, {useState, useRef, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Button, Modal, Input, Checkbox, Popover, Row, Col, Calendar, Switch, Slider} from 'antd';

import {close_modal_if_success, SharingHelp} from './modal_common';
import {IconForColorType} from '../widgets/IconForColorType';

import moment from 'moment';
import {init_quicktype, set_moment, is_quicktype_char, proc_input, QuicktypeHelp} from '../logic/date_quicktype';
import {moment_to_day, scope_name, friendly_date} from '../functions';
import {close_modal, do_interact} from '../state/actions';
import {ItemBreadcrumb} from '../widgets/ItemBreadcrumb';

import {
    BackwardOutlined,
    ForwardOutlined,
    EditOutlined,
    DeleteOutlined,
    QuestionCircleOutlined,
    CloseCircleOutlined,
    CheckSquareOutlined,
} from '@ant-design/icons';

export function ModalUpdate(props) {
    const dispatch=useDispatch();
    const modal=useSelector((state) => state.local.modal);
    const item=useSelector((state) => (
        modal.type==='update' ? state[modal.scope][modal.itemid] || null : null
    ));

    const [name, set_name]=useState('');
    const [delete_confirmed, set_delete_confirmed]=useState(false);
    // project
    const [shared, set_shared]=useState(false);
    // task
    const [desc,set_desc]=useState('');
    const [status, set_status]=useState('');
    const [due_quicktype, set_due_quicktype]=useState(init_quicktype(null));
    const [due_hour, set_due_hour]=useState(0);

    const quicktype_ref=useRef(null);

    useEffect(() => { // on item update: restore name and status
        if(item===null) {
            if(modal.visible && modal.type==='update') // item not found: modal should be closed
                dispatch(close_modal());
        } else {
            set_name(item.name);
            set_delete_confirmed(false);
            set_shared(!!item.share_hash);
            set_desc(item.desc||'');
            set_status(item.status||'active');
            set_due_quicktype(init_quicktype(item.due || null));
            set_due_hour(moment.unix(item.due).hour());
        }
    }, [modal, item, dispatch]);

    function do_post() {
        dispatch(do_interact('update', modal.scope, {
            id: modal.itemid,
            name: name,
            ...(modal.scope==='task' ? {
                status: status,
                desc: desc||null,
                due: due_quicktype.moment===null ? null : (due_quicktype.moment.unix()+due_hour*3600),
            } : {}),
            ...(modal.scope==='project' ? {
                shared: shared,
            } : {}),
        }))
            .then(close_modal_if_success(dispatch));
    }

    function do_delete() {
        if(delete_confirmed)
            dispatch(do_interact('delete', modal.scope, {
                ids: [modal.itemid],
                parent_id: item.parent_id,
            }))
                .then(close_modal_if_success(dispatch));
        else
            set_delete_confirmed(true);
    }

    function on_select_date(date, _mode) {
        set_due_quicktype(set_moment(date));
    }

    function calendar_header_render({value, type, onChange, onTypeChange}) {
        return (
            <div className="custom-ant-calendar-title">
                <Button type="link" onClick={() => onChange(value.clone().add(-1, 'month'))}>
                    <BackwardOutlined />{value.clone().add(-1, 'month').month()+1}
                </Button>
                {value.year()}年{value.month()+1}月
                <Button type="link" onClick={() => onChange(value.clone().add(+1, 'month'))}>
                    {value.clone().add(+1, 'month').month()+1}<ForwardOutlined />
                </Button>
                <Button type="link" onClick={() => onChange(moment_to_day(moment()).add(1, 'day'))}>
                    明天
                </Button>
                <Button type="link" onClick={() => onChange(moment_to_day(moment()).add(1, 'week'))}>
                    下周
                </Button>
            </div>
        );
    }

    // handle keyboard event
    useEffect(() => {
        if(modal.type!=='update' || !modal.visible) return;

        function handler(e) {
            //console.log(e.key);

            // skip if we are in other inputs
            if(['input', 'textarea'].indexOf(e.target.tagName.toLowerCase())!==-1)
                return;

            if(e.key.toLowerCase()==='enter')
                do_post();

            if(e.ctrlKey || e.altKey || e.metaKey)
                return;

            if(is_quicktype_char(e.key)) {
                e.preventDefault();
                console.log('got quicktype event', e);
                set_due_quicktype(proc_input(due_quicktype, e.key.toLowerCase()==='backspace' ? '\b' : e.key.toLowerCase()));
                if(quicktype_ref.current)
                    quicktype_ref.current.focus();
            }
        }

        document.addEventListener('keydown', handler, {passive: false});
        return () => {
            document.removeEventListener('keydown', handler, {passive: false});
        }
    });

    if(modal.type!=='update') return (<Modal visible={false} />);

    return (
        <Modal
            visible={modal.visible}
            title={
                modal.args && modal.args.from_modal_add ?
                    <span><CheckSquareOutlined /> 已创建{scope_name(modal.scope)}，请完善信息</span> :
                    <span><EditOutlined /> 编辑{scope_name(modal.scope)}</span>
            }
            width={modal.scope==='task' ? 700 : undefined}
            centered={modal.scope==='task' && window.innerHeight<=750}
            onCancel={() => dispatch(close_modal())}
            onOk={do_post}
            destroyOnClose={true}
        >
            <div>
                <Button type="danger" className="modal-btnpair-btn" onClick={do_delete} disabled={shared}>
                    {delete_confirmed ? '删除' : <DeleteOutlined />}
                </Button>
                <Input
                    className="modal-btnpair-input" value={name} onChange={(e) => set_name(e.target.value)}
                    key={modal.visible} autoFocus={modal.scope!=='task'} onPressEnter={do_post}
                    addonBefore={modal.scope!=='zone' && <ItemBreadcrumb scope={modal.scope} id={modal.itemid} hide_last={true} />}
                />
            </div>
            {modal.scope==='project' && !item.external &&
                <p>
                    <br />
                    <Checkbox checked={shared} onChange={(e) => set_shared(e.target.checked)}>分享给其他用户</Checkbox>
                    <Popover title="用户间分享" content={<SharingHelp />} trigger="click" placement="bottom">
                        <a><QuestionCircleOutlined /></a>
                    </Popover>
                </p>
            }
            {modal.scope==='task' && <br />}
            {modal.scope==='task' &&
                <Row gutter={6}>
                    <Col xs={24} md={12}>
                        <p>
                            <Input.TextArea
                                value={desc} onChange={(e)=>set_desc(e.target.value)}
                                onPressEnter={(e)=>{if(e.ctrlKey) do_post()}}
                                autoSize={{minRows: 1, maxRows: 5}}
                                placeholder="（备注）" allowClear={true}
                            />
                        </p>
                        <br />
                        <p>
                            <Switch
                                size="small" className="modal-update-custom-switch"
                                checked={status==='active'} onChange={(c)=>set_status(c?'active':'placeholder')}
                            />
                            <b onClick={()=>set_status(status==='active'?'placeholder':'active')}> {status==='active' ? '已布置' : '未布置'} </b>
                            {due_quicktype.moment===null ? '无截止日期' :
                                friendly_date(due_quicktype.moment.unix(), false)+(due_hour?(' '+due_hour+'点'):'')+' 截止'
                            }
                            {due_quicktype.moment!==null &&
                                <a onClick={() => {
                                    set_due_quicktype(set_moment(null))
                                }}>
                                    &nbsp; <CloseCircleOutlined /> &nbsp;
                                </a>
                            }
                        </p>
                        {!!due_quicktype.moment &&
                            <>
                                <Slider
                                    value={due_hour===0?7:due_hour} onChange={(t)=>set_due_hour(t===7?0:t)}
                                    tooltipVisible={false} className="modal-update-custom-slider"
                                    min={7} max={23} marks={{7:'', 8:'8', 10:'10', 13:'13', 15:'15', 18:'18', 23:'23'}}
                                />
                            </>
                        }
                        {due_quicktype.placeholder &&
                            <Popover title="日期输入方式" content={<QuicktypeHelp />} placement="bottom" trigger="click">
                                <p><a>
                                    &nbsp;{due_quicktype.placeholder}&nbsp;
                                    <QuestionCircleOutlined />
                                </a></p>
                            </Popover>
                        }
                        <br />
                    </Col>
                    <Col xs={24} md={12}>
                        <Calendar
                            value={due_quicktype.moment===null ? moment_to_day(moment()) : due_quicktype.moment}
                            onSelect={on_select_date}
                            fullscreen={false} headerRender={calendar_header_render} className="custom-ant-calender"
                        />
                    </Col>
                </Row>
            }
        </Modal>
    );
}