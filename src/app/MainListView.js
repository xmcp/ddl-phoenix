import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Icon, Tag} from 'antd';

import {SideHeaderLayout} from '../widgets/Layout';
import {PoppableText} from '../widgets/PoppableText';
import {scope_name, next_scope, colorize, colortype} from '../functions';
import {show_modal} from '../state/actions';

import './MainListView.less';
import {TaskView} from './TaskView';
import {ClickableText} from '../widgets/ClickableText';

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
            <Icon type="menu" /> {props.item.name}
        </PoppableText>
    )
}

function ProjectView(props) {
    const dispatch=useDispatch();
    const project=useSelector((state)=>state.project[props.pid]);

    return (
        <SideHeaderLayout header={<SectionHeader scope="project" id={props.pid} item={project} />}>
            {project.task_order.map((tid)=>(
                <TaskView key={tid} tid={tid} />
            ))}
            <ClickableText onClick={()=>dispatch(show_modal('add','task',props.pid))}>
                <Icon type="plus" />
            </ClickableText>
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