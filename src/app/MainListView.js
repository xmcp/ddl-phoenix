import React, {useState, useEffect, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Badge, Tooltip, message, Modal} from 'antd';
import {CSSTransition} from 'react-transition-group';

import {TaskView} from './TaskView';
import {HEADER_MENU} from './AppHeader';
import {SideHeaderLayout} from '../widgets/Layout';
import {PoppableText} from '../widgets/PoppableText';
import {ClickableText} from '../widgets/ClickableText';
import {MainListSortable} from '../widgets/MainListSortable';
import {IconForColorType} from '../widgets/IconForColorType';

import copy from 'copy-to-clipboard';
import {scope_name, next_scope, colortype, dflt} from '../functions';
import {show_modal, do_update_completeness} from '../state/actions';
import {test_term} from '../logic/fancy_search_core';

import './MainListView.less';
import {
    PlusOutlined,
    AppstoreOutlined,
    ShareAltOutlined,
    DoubleRightOutlined,
    EditOutlined,
    GiftOutlined,
    WifiOutlined,
    VerticalAlignMiddleOutlined,
    DragOutlined,
    HourglassOutlined,
    MoreOutlined,
    UpOutlined,
    DownOutlined
} from '@ant-design/icons';

function SectionHeader(props) {
    const dispatch=useDispatch();

    let cs=props.scope;
    let ns=next_scope(cs);
    let csname=scope_name(props.scope);
    let nsname=scope_name(ns);

    let active_subtasks=useSelector((state)=>(
        props.scope!=='project' ? [] : props.item.task_order
            .map((tid)=>state.task[tid])
            .filter((task)=>task.status==='active' && task.completeness==='todo')
    ));

    let menu=[
        ...(props.item.external ? [] : [
            {
                children: (<span><PlusOutlined /> 新建子{nsname}</span>),
                onClick: ()=>dispatch(show_modal('add',ns,props.id)),
            },
            {
                children: (<span><AppstoreOutlined /> 整理{nsname}</span>),
                onClick: ()=>dispatch(show_modal('reorder',ns,props.id)),
                _key: 'reorder',
            },
        ]),
        ...((cs!=='project' || !props.item.share_hash) ? [] : [
            {
                children: (<span><ShareAltOutlined /> 复制分享 ID</span>),
                onClick: ()=>{
                    if(copy(props.item.name.replace(/\n/,' ')+'@@'+props.item.share_hash))
                        message.success('已复制',2);
                },
            }
        ]),
        ...(!active_subtasks.length ? [] : [
            {
                children: (<span><DoubleRightOutlined /> 完成所有待办任务</span>),
                onClick: ()=>{
                    Modal.confirm({
                        icon: (<DoubleRightOutlined />),
                        title: `将 ${active_subtasks.length} 个待办任务标为完成`,
                        content: (
                            <ul>
                                {active_subtasks.map((task)=>(
                                    <li key={task.id}>
                                        {task.name}
                                    </li>
                                ))}
                            </ul>
                        ),
                        okText: (<span>确定<span style={{display: 'none'}}>.</span></span>), // https://github.com/ant-design/ant-design/issues/21692
                        cancelText: (<span>取消<span style={{display: 'none'}}>.</span></span>),
                        onOk() {
                            dispatch(do_update_completeness(active_subtasks.map((task)=>task.id),'done'));
                        },
                        onCancel() {},
                    });
                },
            }
        ]),
        {
            children: (<span><EditOutlined /> 编辑{csname} “{props.item.name}”</span>),
            onClick: ()=>dispatch(show_modal('update',cs,props.id)),
        },
    ];
    if(props.item[ns+'_order'].length===0) // empty
        menu=menu.filter((menuitem)=>menuitem._key!=='reorder'); // remove reorder

    let name_ui=(
        <>
            {props.item.name}
            {props.item.external &&
                <Tooltip title="来自其他用户的分享" className="project-icon-shared">
                    &nbsp;<GiftOutlined />
                </Tooltip>
            }
            {!!props.item.share_hash &&
                <Tooltip title="分享给其他用户" className="project-icon-sharing">
                    &nbsp;<WifiOutlined />
                </Tooltip>
            }
        </>
    );

    return (
        <span>
            {!!props.set_expanded &&
                <span className="section-header-right-status">
                    {props.expanded ? <UpOutlined /> : <DownOutlined />}
                </span>
            }
            {props.set_expanded ?
                <>
                    <PoppableText menu={menu} className={'should-highlight no-min-width section-header-'+props.scope}>
                        <span className={'reorder-handle reorder-handle-'+props.scope}><MoreOutlined /> </span>
                    </PoppableText>
                    {name_ui}
                </> :
                <PoppableText menu={menu} className={'should-highlight section-header-'+props.scope}>
                    <span className={'reorder-handle reorder-handle-'+props.scope}><MoreOutlined /> </span>
                    {name_ui}
                </PoppableText>
            }
        </span>
    );
}

function ProjectView(props) {
    const dispatch=useDispatch();
    const project=useSelector((state)=>state.project[props.pid]);
    const tasks=useSelector((state)=>state.task);
    const settings=useSelector((state) => state.user.settings);

    const [expanded,set_expanded]=useState(false);
    const refresh_key=useSelector((state)=>state.local.refresh_key)+(expanded?1:0);

    let task_collapse_badge_style={
        className: "task-collapse-badge",
        style: {backgroundColor: '#fff', color: '#999', boxShadow: '0 0 0 1px #d9d9d9 inset'},
        offset: [2,-3],
    };

    let sticky_task=useRef({map: {}, key: refresh_key});
    if(sticky_task.current.key!==refresh_key) {
        sticky_task.current.map={};
        sticky_task.current.key=refresh_key;
    }

    let cnt={done: 0, ignored: 0};
    let tasks_to_display;

    if(expanded) {
        tasks_to_display=project.task_order;
    } else {
        if(dflt(settings.collapse_all_past,false)) { // hide all
            tasks_to_display=project.task_order.filter((tid)=>{
                let ctype=colortype(tasks[tid]);
                let should_show=sticky_task.current.map[tid] || !(ctype==='done' || ctype==='ignored');

                if(should_show)
                    sticky_task.current.map[tid]=true;
                else
                    cnt[ctype]++;

                return should_show;
            });
        } else { // hide prefix
            let task_start_idx=0;
            for(;task_start_idx<project.task_order.length;task_start_idx++) {
                let tid=project.task_order[task_start_idx];
                let ctype=colortype(tasks[tid]);
                let should_show=sticky_task.current.map[tid] || !(ctype==='done' || ctype==='ignored');

                if(should_show)
                    break;
                else
                    cnt[ctype]++;
            }
            if(task_start_idx) {
                task_start_idx--;
                cnt[colortype(tasks[project.task_order[task_start_idx]])]--;
            }
            tasks_to_display=project.task_order.filter((tid,idx)=>{
                if(idx>task_start_idx)
                    sticky_task.current.map[tid]=true;

                return idx>=task_start_idx;
            });
        }
    }

    const popup_container_ref=useRef(null);

    return (
        <SideHeaderLayout header={<SectionHeader scope="project" id={props.pid} item={project} />} headerClassName="project-header-container">
            <div ref={popup_container_ref} />
            <div className={expanded ? 'task-list-expanded width-container-rightonly' : 'task-list-collapsed width-container-rightonly-padded'}>
                {expanded ?
                    <ClickableText onClick={()=>set_expanded(false)} className="have-hover-bg task-collapse-widget">
                        <VerticalAlignMiddleOutlined /> <span className="task-collapse-label">收起</span>
                    </ClickableText> :
                    <ClickableText onClick={()=>set_expanded(true)} className="have-hover-bg task-collapse-widget">
                        <DragOutlined />
                        {cnt.done>0 &&
                            <Badge count={cnt.done} {...task_collapse_badge_style} title={'已完成'+cnt.done+'项'}>
                                <IconForColorType type="done" />
                            </Badge>
                        }
                        {cnt.ignored>0 &&
                            <Badge count={cnt.ignored} {...task_collapse_badge_style}  title={'搁置'+cnt.done+'项'}>
                                <HourglassOutlined />
                            </Badge>
                        }
                    </ClickableText>
                }
                <MainListSortable
                    scope="task" id={props.pid} subs={tasks_to_display}
                    key={expanded} // https://github.com/SortableJS/react-sortablejs/issues/118
                    underlying={{
                        tag: "span",
                        direction: 'horizontal',
                        disabled: !expanded,
                    }}
                >
                    {tasks_to_display.map((tid)=>(
                        <TaskView
                            key={tid} tid={tid} external={project.external} todo_style={false}
                            can_sort={expanded && !project.external} popup_container_ref={popup_container_ref}
                        />
                    ))}
                </MainListSortable>
                {tasks_to_display.length===0 &&
                    <span className="task-empty-label">
                        无待办任务 &nbsp;
                    </span>
                }
                <ClickableText onClick={()=>dispatch(show_modal('add','task',props.pid))}>
                    <PlusOutlined />
                </ClickableText>
            </div>
            <div className="project-margin" />
        </SideHeaderLayout>
    );
}

function ZoneView(props) {
    const dispatch=useDispatch();
    const zone=useSelector((state)=>state.zone[props.zid]);
    const term=useSelector((state)=>state.local.fancy_search_term);
    const projects=useSelector((state)=>state.project);

    let project_order_disp=zone.project_order;

    const [expanded,set_expanded]=useState(false);

    // auto change collapse state
    useEffect(()=>{
        if(!props.collapsible)
            set_expanded(false);
    },[props.collapsible]);
    useEffect(()=>{
        set_expanded(!!term);
    },[term]);

    if(term)
        project_order_disp=project_order_disp.filter((pid)=>test_term(zone.name+' '+projects[pid].name,term));

    if(term && project_order_disp.length===0)
        return null;

    let projects_ui=(
        <MainListSortable scope="project" id={props.zid} subs={zone.project_order}>
            {project_order_disp.map((pid)=>(
                <ProjectView key={pid} pid={pid} />
            ))}
        </MainListSortable>
    );

    return (
        <div>
            <SideHeaderLayout
                headerClassName={'zone-header-container'+(props.collapsible ? ' zone-header-container-clickable' : '')}
                headerOnClick={set_expanded ? (e)=>{
                    if(!e.target.closest('.section-header-zone'))
                        set_expanded(!expanded);
                } : null}
                header={
                    <SectionHeader scope="zone" id={props.zid} item={zone} expanded={expanded} set_expanded={props.collapsible ? set_expanded : null} />
                }
            >
                {props.collapsible ?
                    <CSSTransition in={expanded} timeout={600} classNames="zone-collapse-anim">
                        {expanded ? projects_ui : <div />}
                    </CSSTransition> :
                    projects_ui
                }
                {project_order_disp.length===0 &&
                    <div className="project-header-container">
                        <ClickableText onClick={()=>dispatch(show_modal('add','project',props.zid))} className="section-header-project">
                            <PlusOutlined /> 新建类别
                        </ClickableText>
                    </div>
                }
            </SideHeaderLayout>
            <div className="zone-margin" />
        </div>
    );
}

export function MainListView(props) {
    const dispatch=useDispatch();
    const zone_order=useSelector((state)=>state.zone_order);
    const slim=useSelector((state)=>state.local.is_slim);
    const term=useSelector((state)=>state.local.fancy_search_term);

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
            <MainListSortable scope="zone" id={null} subs={zone_order}>
                {zone_order.map((zid)=>(
                    <ZoneView key={zid} zid={zid} collapsible={slim} />
                ))}
            </MainListSortable>
            {slim ?
                <div>
                    {!term &&
                        <PoppableText menu={HEADER_MENU(dispatch)}>
                            <MoreOutlined /> 共 {zone_order.length} 门课程
                        </PoppableText>
                    }
                </div> :
                <div className="zone-header-container">
                    <ClickableText onClick={()=>dispatch(show_modal('add','zone',null))} className="section-header-zone">
                        <PlusOutlined /> 新建课程
                    </ClickableText>
                </div>
            }
        </div>
    );
}