import React, {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Icon, Badge} from 'antd';

import {TaskView} from './TaskView';
import {SideHeaderLayout} from '../widgets/Layout';
import {PoppableText} from '../widgets/PoppableText';
import {ClickableText} from '../widgets/ClickableText';
import {IconForColorType} from '../widgets/IconForColorType';

import {scope_name, next_scope, colortype} from '../functions';
import {show_modal} from '../state/actions';

import './MainListView.less';

function SectionHeader(props) {
    const dispatch=useDispatch();

    let cs=props.scope;
    let ns=next_scope(cs);
    let csname=scope_name(props.scope);
    let nsname=scope_name(ns);

    return (
        <PoppableText menu={[
            {
                children: (<span><Icon type="plus" /> 新建{nsname}</span>),
                onClick: ()=>dispatch(show_modal('add',ns,props.id)),
            },
            {
                children: (<span><Icon type="appstore" /> 调整{nsname}顺序</span>),
                onClick: ()=>dispatch(show_modal('reorder',ns,props.id)),
            },
            {
                children: (<span><Icon type="edit" /> 编辑{csname} “{props.item.name}”</span>),
                onClick: ()=>dispatch(show_modal('update',cs,props.id)),
            },
        ]}>
            <Icon type="more" /> {props.item.name}
        </PoppableText>
    )
}

function ProjectView(props) {
    const project=useSelector((state)=>state.project[props.pid]);
    const tasks=useSelector((state)=>state.task);

    const [expanded,set_expanded]=useState(false);

    let start_idx=0;
    let cnt={done: 0, ignored: 0};
    if(!expanded)
        while(start_idx<project.task_order.length) {
            let ctype=colortype(tasks[project.task_order[start_idx]]);
            if(ctype==='done' || ctype==='ignored') {
                cnt[ctype]++;
                start_idx++;
            } else
                break;
        }

    let task_collapse_badge_style={
        className: "task-collapse-badge",
        style: { backgroundColor: '#fff', color: '#999', boxShadow: '0 0 0 1px #d9d9d9 inset' },
        offset: [2,-3],
    };

    let tasks_to_display=expanded ? project.task_order : project.task_order.filter((tid,idx)=>(idx>=start_idx));

    return (
        <SideHeaderLayout header={<SectionHeader scope="project" id={props.pid} item={project} />}>
            <div className={expanded ? 'task-list-expanded width-container-rightonly' : 'task-list-collapsed'}>
                {expanded ?
                    <ClickableText onClick={()=>set_expanded(false)} className="have-hover-bg">
                        <Icon type="vertical-align-middle" /> <span className="task-collapse-label">收起</span>
                    </ClickableText> :
                    <ClickableText onClick={()=>set_expanded(true)} className="have-hover-bg">
                        <Icon type="fullscreen" />
                        {cnt.done>0 &&
                        <Badge count={cnt.done} {...task_collapse_badge_style} title={'已完成'+cnt.done+'项'}>
                            <IconForColorType type="done" />
                        </Badge>
                        }
                        {cnt.ignored>0 &&
                            <Badge count={cnt.ignored} {...task_collapse_badge_style}  title={'忽略'+cnt.done+'项'}>
                                <Icon type="stop" />
                            </Badge>
                        }
                    </ClickableText>
                }
                {tasks_to_display.map((tid)=>(
                    <TaskView key={tid} tid={tid} />
                ))}
                {tasks_to_display.length===0 &&
                    <span className="task-empty-label">
                        无待办任务
                    </span>
                }
            </div>
            <div className="project-margin" />
        </SideHeaderLayout>
    )
}

function ZoneView(props) {
    const dispatch=useDispatch();
    const zone=useSelector((state)=>state.zone[props.zid]);

    return (
        <SideHeaderLayout header={<SectionHeader scope="zone" id={props.zid} item={zone} />}>
            {zone.project_order.map((pid)=>(
                <ProjectView key={pid} pid={pid} />
            ))}
            {zone.project_order.length===0 &&
                <ClickableText onClick={()=>dispatch(show_modal('add','project',props.zid))}>
                    <Icon type="plus" />
                </ClickableText>
            }
            <div className="zone-margin" />
        </SideHeaderLayout>
    )
}

export function MainListView(props) {
    const dispatch=useDispatch();
    const zone_order=useSelector((state)=>state.zone_order);

    return (
        <div>
            <div className="xl-only legend">
                <SideHeaderLayout header={<span>课程</span>}>
                    <SideHeaderLayout header={<span>项目</span>}>
                        <span>任务</span>
                    </SideHeaderLayout>
                </SideHeaderLayout>
                <div className="project-margin" />
            </div>
            {zone_order.map((zid)=>(
                <ZoneView key={zid} zid={zid} />
            ))}
            {zone_order.length===0 &&
                <ClickableText onClick={()=>dispatch(show_modal('add','zone',null))}>
                    <Icon type="plus" />
                </ClickableText>
            }
        </div>
    );
}