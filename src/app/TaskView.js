import {Icon, Tag} from 'antd';
import {useSelector, useDispatch} from 'react-redux';
import {colortype, colorize, completeness_name} from '../functions';
import React from 'react';

import './TaskView.less';
import {PoppableText} from '../widgets/PoppableText';
import {show_modal, do_update_completeness, do_update_task_direct_done} from '../state/actions';
import {IconForColorType} from '../widgets/IconForColorType';

function gen_menu_for_task(tid,task,dispatch) {
    let MENU_UPDATE={
        children: (<span><Icon type="edit" /> 编辑 “{task.name}”</span>),
        onClick: ()=>dispatch(show_modal('update','task',tid)),
    };
    let MENU_COMPL=(compl)=>({
        children: (<span><IconForColorType type={compl} /> {completeness_name(compl)}</span>),
        onClick: ()=>dispatch(do_update_completeness(tid,compl)),
    });
    let compl_order=['todo','done','highlight','ignored'];

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

export function TaskView(props) {
    const task=useSelector((state)=>state.task[props.tid]);
    const dispatch=useDispatch();

    let ctype=colortype(task);
    let [bgcolor,fgcolor,bdcolor]=colorize(ctype);

    return (
        <PoppableText menu={gen_menu_for_task(props.tid,task,dispatch)}>
            <Tag style={{backgroundColor: bgcolor, color: fgcolor, borderColor: bdcolor}} className="custom-ant-tag">
                <IconForColorType type={ctype} className="task-badge-icon" />
                {task.name}
            </Tag>
        </PoppableText>
    );
}