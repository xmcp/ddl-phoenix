import React, {useMemo, useState, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Icon, Tooltip, Popover, Radio} from 'antd';

import {IconForColorType} from '../widgets/IconForColorType';

import {colortype, completeness_name, friendly_date} from '../functions';
import {show_modal, do_update_completeness} from '../state/actions';

import './TaskView.less';

const STABLIZE_THRESHOLD_MS=100;

function WithDueTooltip(props) {
    let ctype=colortype(props.task);
    let ctype_name=completeness_name(ctype);

    let tooltip_text=(
        <div className="due-tooltip">
            <p>
                {props.task.complete_timestamp ? (friendly_date(props.task.complete_timestamp)+' ') : ''}
                {ctype_name}
            </p>
            <p>
                {props.task.due ?
                    (friendly_date(props.task.due, false)+' 截止') :
                    '无截止日期'
                }
            </p>
        </div>
    );

    return (
        <Tooltip
            title={tooltip_text} trigger="hover"
            visible={props.visible} onVisibleChange={props.onVisibleChange}
            overlayClassName="pointer-event-none" autoAdjustOverflow={false}
            mouseEnterDelay={0} mouseLeaveDelay={0}
            onTouchEnd={props.onTouchEnd}
        >
            {props.children}
        </Tooltip>
    );
}

function TaskViewDetails(props) {
    const dispatch=useDispatch();

    let compl_order=['todo','highlight','done','ignored'];

    function update_compl(compl) {
        dispatch(do_update_completeness(props.tid,compl))
            .then((success)=>{
                if(success)
                    props.hide();
            })
    }

    let ui_compl_value=props.task.completeness;
    // invite user to activte task
    if(!props.external && props.task.status==='placeholder' && ui_compl_value==='todo')
        ui_compl_value='_placeholder';

    return (
        <div className="task-view-details">
            <div
                className={'task-view-details-statline '+(props.external ? '' : 'task-view-details-statline-link')}
                onClick={props.external ? null : ()=>{props.hide(); dispatch(show_modal('update','task',props.tid))}}
            >
                <p>
                    {!props.external &&
                        <a style={{float: 'right'}}><Icon type="edit" /></a>
                    }
                    {props.task.status==='placeholder' &&
                        '未布置，'
                    }
                    {props.task.due ?
                        (friendly_date(props.task.due, false)+' 截止') :
                        '无截止日期'
                    }
                </p>
                {!!props.task.desc &&
                    <p className="task-view-details-desc">{props.task.desc}</p>
                }
            </div>
            <div className="task-view-details-complgroup">
                <Radio.Group value={ui_compl_value} onChange={(e)=>update_compl(e.target.value)}>
                    {compl_order.map((compl)=>(
                        <Radio.Button key={compl} value={compl} style={{paddingLeft: '9px', paddingRight: '9px'}}>
                            <IconForColorType type={compl} /> {completeness_name(compl)}
                        </Radio.Button>
                    ))}
                </Radio.Group>
            </div>
        </div>
    );
}

export function TaskView(props) {
    const task=useSelector((state)=>state.task[props.tid]);
    const [card_mode,set_card_mode]=useState(0); // 0: hidden, 1: tooltip, 2: tooltip+popover

    let last_touch_end_ts=useRef(-STABLIZE_THRESHOLD_MS);
    let last_vis_change_ts=useRef(-STABLIZE_THRESHOLD_MS);

    function on_touch_end() {
        last_touch_end_ts.current=(+new Date());
    }

    function may_set_card_mode(m) {
        if((+new Date())-last_vis_change_ts.current>STABLIZE_THRESHOLD_MS) {
            last_vis_change_ts.current=(+new Date());
            set_card_mode(m);
        }
    }

    function on_tooltip_visible_change(v) {
        if(card_mode>1) return;
        if(v) {
            // simulate click if is touched
            may_set_card_mode((+new Date())-last_touch_end_ts.current<STABLIZE_THRESHOLD_MS ? 2 : 1);
        } else {
            may_set_card_mode(0);
        }
    }
    function on_popover_visible_change(v) {
        may_set_card_mode(v ? 2 : 0);
    }

    let ctype=colortype(task);
    return useMemo(()=>(
        <span className={'task-view '+(props.can_sort?'reorder-handle reorder-handle-task':'')} onTouchEnd={on_touch_end}>
            <WithDueTooltip
                task={task}
                visible={card_mode>=1} onVisibleChange={on_tooltip_visible_change}
            >
                <Popover
                    title="任务属性" trigger="click" placement="bottom"
                    content={<TaskViewDetails tid={props.tid} external={props.external} task={task} hide={()=>on_popover_visible_change(false)} />}
                    visible={card_mode>=2} onVisibleChange={on_popover_visible_change}
                    overlayClassName="task-details-custom-popover"
                >
                    <span className={'task-badge task-color-'+ctype}>
                        <IconForColorType type={ctype} className="task-badge-icon" />
                        <span className="task-badge-label">{task.name}</span>
                    </span>
                </Popover>
            </WithDueTooltip>
        </span>
    ),[task,card_mode,ctype,props.tid,props.can_sort,props.external]);
}