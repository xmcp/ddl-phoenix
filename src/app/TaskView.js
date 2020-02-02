import React, {useMemo} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Icon, Tag, Tooltip} from 'antd';

import {PoppableText} from '../widgets/PoppableText';
import {IconForColorType} from '../widgets/IconForColorType';

import {colortype, completeness_name, friendly_date} from '../functions';
import {show_modal, do_update_completeness} from '../state/actions';

import './TaskView.less';

function gen_menu_for_task(tid,task,is_external,dispatch) {
    let MENU_UPDATE=(verb)=>({
        children: (<span><Icon type="edit" /> {verb} “{task.name}”</span>),
        onClick: ()=>dispatch(show_modal('update','task',tid)),
    });
    let MENU_COMPL=(compl,prefix='')=>({
        children: (<span><IconForColorType type={compl} /> {prefix}{completeness_name(compl)}</span>),
        onClick: ()=>dispatch(do_update_completeness(tid,compl)),
    });
    let compl_order=['done','todo','highlight','ignored'];

    if(is_external)
        return (
            compl_order
                .filter((n)=>n!==task.completeness)
                .map((n)=>MENU_COMPL(n))
        );
    else if(task.status==='placeholder')
        return [
            MENU_UPDATE('布置'),
            ...compl_order
                .filter((n)=>n!==task.completeness)
                .map((n)=>MENU_COMPL(n,'立即布置并')),
        ];
    else
        return [
            ...compl_order
                .filter((n)=>n!==task.completeness)
                .map((n)=>MENU_COMPL(n)),
            MENU_UPDATE('编辑'),
        ];
}

function DueTooltip(props) {
    let ctype=colortype(props.task);
    let ctype_name=completeness_name(ctype);

    let tooltip_text=(
        <div>
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
        <Tooltip title={tooltip_text} mouseEnterDelay={0} mouseLeaveDelay={0} overlayClassName="pointer-event-none">
            {props.children}
        </Tooltip>
    );
}

export function TaskView(props) {
    const task=useSelector((state)=>state.task[props.tid]);
    const dispatch=useDispatch();

    let ctype=colortype(task);
    return useMemo(()=>(
        <PoppableText menu={gen_menu_for_task(props.tid,task,props.external,dispatch)}>
            <DueTooltip task={task}>
                <Tag className={'custom-ant-tag task-color-'+ctype}>
                    <IconForColorType type={ctype} className="task-badge-icon" />
                    <span className="task-badge-label">{task.name}</span>
                </Tag>
            </DueTooltip>
        </PoppableText>
    ),[task,ctype,dispatch,props.external,props.tid]);
}