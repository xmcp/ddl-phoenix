import React, {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Icon, Badge, Tooltip, message} from 'antd';
import copy from 'copy-to-clipboard';

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

    let menu=[
        ... props.item.external ? [] : [
            {
                children: (<span><Icon type="plus" /> 新建{nsname}</span>),
                onClick: ()=>dispatch(show_modal('add',ns,props.id)),
            },
            {
                children: (<span><Icon type="appstore" /> 调整{nsname}顺序</span>),
                onClick: ()=>dispatch(show_modal('reorder',ns,props.id)),
            },
        ],
        ... !props.item.share_hash ? [] : [
            {
                children: (<span><Icon type="share-alt" /> 复制分享 ID</span>),
                onClick: ()=>{
                    if(copy(props.item.name.replace(/\n/,' ')+'@@'+props.item.share_hash))
                        message.success('复制成功',2);
                },
            }
        ],
        {
            children: (<span><Icon type="edit" /> 编辑{csname} “{props.item.name}”</span>),
            onClick: ()=>dispatch(show_modal('update',cs,props.id)),
        },
    ];
    if(props.item[ns+'_order'].length===0)
        menu.splice(1,1);

    return (
        <PoppableText menu={menu} className={'section-header-'+props.scope}>
            <Icon type="more" /> {props.item.name}
            {props.item.external &&
                <Tooltip title="来自其他用户的分享" className="project-icon-shared">
                    &nbsp;<Icon type="gift" />
                </Tooltip>
            }
            {!!props.item.share_hash &&
                <Tooltip title="分享给其他用户" className="project-icon-sharing">
                    &nbsp;<Icon type="wifi" />
                </Tooltip>
            }
        </PoppableText>
    )
}

function ProjectView(props) {
    const dispatch=useDispatch();
    const project=useSelector((state)=>state.project[props.pid]);
    const tasks=useSelector((state)=>state.task);

    const [expanded,set_expanded]=useState(false);

    let cnt={done: 0, ignored: 0};
    if(!expanded)
        project.task_order.forEach((tid)=>{
            let ctype=colortype(tasks[tid]);
            if(ctype==='done' || ctype==='ignored')
                cnt[ctype]++;
        });

    let task_collapse_badge_style={
        className: "task-collapse-badge",
        style: { backgroundColor: '#fff', color: '#999', boxShadow: '0 0 0 1px #d9d9d9 inset' },
        offset: [2,-3],
    };

    let tasks_to_display=expanded ? project.task_order : project.task_order.filter((tid)=>{
        let ctype=colortype(tasks[tid]);
        return !(ctype==='done' || ctype==='ignored');
    });

    return (
        <SideHeaderLayout header={<SectionHeader scope="project" id={props.pid} item={project} />}>
            {project.task_order.length===0 ?

                <ClickableText onClick={()=>dispatch(show_modal('add','task',props.pid))} className="have-hover-bg task-collapse-widget">
                    <Icon type="plus" /> 创建任务
                </ClickableText> :

                <div className={expanded ? 'task-list-expanded width-container-rightonly' : 'task-list-collapsed width-container-rightonly-padded'}>
                    {expanded ?
                        <ClickableText onClick={()=>set_expanded(false)} className="have-hover-bg task-collapse-widget">
                            <Icon type="vertical-align-middle" /> <span className="task-collapse-label">收起</span>
                        </ClickableText> :
                        <ClickableText onClick={()=>set_expanded(true)} className="have-hover-bg task-collapse-widget">
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
                        <TaskView key={tid} tid={tid} external={project.external} />
                    ))}
                    {tasks_to_display.length===0 &&
                        <span className="task-empty-label">
                            无待办任务
                        </span>
                    }
                </div>
            }
            <div className="project-margin" />
        </SideHeaderLayout>
    )
}

function ZoneView(props) {
    const dispatch=useDispatch();
    const zone=useSelector((state)=>state.zone[props.zid]);

    return (
        <SideHeaderLayout headerClassName="zone-header-container" header={<SectionHeader scope="zone" id={props.zid} item={zone} />}>
            {zone.project_order.map((pid)=>(
                <ProjectView key={pid} pid={pid} />
            ))}
            {zone.project_order.length===0 &&
                <ClickableText onClick={()=>dispatch(show_modal('add','project',props.zid))}>
                    <Icon type="plus" /> 创建类别
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
                    <SideHeaderLayout header={<span>类别</span>}>
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
                    <Icon type="plus" /> 创建课程
                </ClickableText>
            }
        </div>
    );
}