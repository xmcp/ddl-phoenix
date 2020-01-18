import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Icon, Tag, Tooltip} from 'antd';

import {PoppableText} from '../widgets/PoppableText';
import {IconForColorType} from '../widgets/IconForColorType';

import {colortype, completeness_name, friendly_date} from '../functions';
import {show_modal, do_update_completeness, do_update_task_direct_done} from '../state/actions';

import './TaskView.less';

function gen_menu_for_task(tid,task,dispatch) {
    let MENU_UPDATE={
        children: (<span><Icon type="edit" /> 编辑 “{task.name}”</span>),
        onClick: ()=>dispatch(show_modal('update','task',tid)),
    };
    let MENU_COMPL=(compl)=>({
        children: (<span><IconForColorType type={compl} /> {completeness_name(compl)}</span>),
        onClick: ()=>dispatch(do_update_completeness(tid,compl)),
    });
    let compl_order=['done','todo','highlight','ignored'];

    if(task.status==='placeholder')
        return [
            MENU_UPDATE,
            {
                children: (<span><IconForColorType type="done" /> 直接标为已完成</span>),
                onClick: ()=>dispatch(do_update_task_direct_done(tid)),
            },
        ];
    else
        return [
            ...compl_order
                .filter((n)=>n!==task.completeness)
                .map((n)=>MENU_COMPL(n)),
            MENU_UPDATE,
        ];
}

function DueTooltip(props) {
    let ctype_name=completeness_name(colortype(props.task));

    if(props.task.status==='active' && props.task.due)
        return (
            <Tooltip title={friendly_date(props.task.due,false)+' 截止，'+ctype_name} mouseEnterDelay={0} overlayClassName="pointer-event-none">
                {props.children}
            </Tooltip>
        );
    else
        return (
            <Tooltip title={ctype_name} mouseEnterDelay={0} overlayClassName="pointer-event-none">
                {props.children}
            </Tooltip>
        )
}

export function TaskView(props) {
    const task=useSelector((state)=>state.task[props.tid]);
    const dispatch=useDispatch();

    let ctype=colortype(task);
    return (
        <PoppableText menu={gen_menu_for_task(props.tid,task,dispatch)}>
            <DueTooltip task={task}>
                <Tag className={'custom-ant-tag task-color-'+ctype}>
                    <IconForColorType type={ctype} className="task-badge-icon" />
                    <span className="task-badge-label">{task.name}</span>
                </Tag>
            </DueTooltip>
        </PoppableText>
    );
}