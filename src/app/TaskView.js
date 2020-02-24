import React, {useMemo, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Icon, Tooltip, Popover, Radio} from 'antd';

import {IconForColorType} from '../widgets/IconForColorType';

import {colortype, completeness_name, friendly_date} from '../functions';
import {show_modal, do_update_completeness} from '../state/actions';

import './TaskView.less';

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
            overlayClassName="pointer-event-none" autoAdjustOverflow={false}
            mouseEnterDelay={0} mouseLeaveDelay={0}
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

    return (
        <div className="task-view-details">
            <div
                className={'task-view-details-statline '+(props.external ? '' : 'task-view-details-statline-link')}
                onClick={props.external ? null : ()=>{props.hide(); dispatch(show_modal('update','task',props.tid))}}
            >
                <p>
                    {!props.external &&
                        <a style={{float: 'right'}}>
                            <Icon type="edit" />
                        </a>
                    }
                    {props.task.status==='placeholder' ? '未布置，' : ''}
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
                <Radio.Group value={props.task.completeness} onChange={(e)=>update_compl(e.target.value)}>
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
    const [show_popover,set_show_popover]=useState(false);

    let ctype=colortype(task);
    return useMemo(()=>(
        <span className={'task-view '+(props.can_sort?'reorder-handle reorder-handle-task':'')}>
            <WithDueTooltip task={task}>
                <Popover
                    title="任务属性" trigger="click" placement="bottom"
                    content={<TaskViewDetails tid={props.tid} external={props.external} task={task} hide={()=>set_show_popover(false)} />}
                    visible={show_popover} onVisibleChange={set_show_popover}
                    overlayClassName="task-details-custom-popover"
                >
                    <span className={'task-badge task-color-'+ctype}>
                        <IconForColorType type={ctype} className="task-badge-icon" />
                        <span className="task-badge-label">{task.name}</span>
                    </span>
                </Popover>
            </WithDueTooltip>
        </span>
    ),[task,show_popover,ctype,props.tid,props.can_sort]);
}