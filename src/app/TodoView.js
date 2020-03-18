import React, {useMemo} from 'react';
import {useSelector} from 'react-redux';
import LazyLoad from 'react-lazyload';

import {TaskView} from './TaskView';
import {ClickableText} from '../widgets/ClickableText';

import moment from 'moment';
import {moment_to_day, days_to, dflt} from '../functions';

import './TodoView.less';
import {InboxOutlined, CaretUpOutlined, CaretDownOutlined} from '@ant-design/icons';

const INF=1e50; // as sort key

function TodoTaskView(props) {
    const project_external=useSelector((state)=>state.project[props.task.parent_id].external);

    return (
        <TaskView
            tid={props.task.id} external={project_external} todo_style={true}
            can_sort={false} popup_container_ref={null}
        />
    )
}

export function TodoViewFx(props) {
    const settings=useSelector((state)=>state.user.settings);
    const tasks=useSelector((state)=>state.task);
    const todo_tasks=useMemo(()=>(
        tasks ? Object.values(tasks).filter((t)=>t.completeness!=='done' && (t.status==='active'||t.completeness!=='todo')) : []
    ),[tasks]);
    const compl_tasks=useMemo(()=>(
        tasks ? Object.values(tasks).filter((t)=>t.completeness==='done') : []
    ),[tasks]);

    const todo_max_lines=dflt(settings.todo_max_lines,5);

    let todo_ui, compl_ui, todo_cnt;

    let today=moment_to_day(moment());
    function get_task_order(t) {
        // highlight
        if(t.completeness==='highlight')
            return -INF;

        let d=(t.due===null ? null : days_to(moment_to_day(moment.unix(t.due)),today));

        // ignored && not going to due
        if(t.completeness==='ignored' && (d===null || d>0))
            return +2*INF;

        // no due
        if(d===null)
            return +INF;

        // normal
        return d;
    }

    let todo_tasks_sorted=todo_tasks.slice().sort((a,b)=>(
        get_task_order(a)-get_task_order(b)
    ));

    let compl_tasks_sorted=compl_tasks.slice().sort((a,b)=>(
        (b.complete_timestamp||0)-(a.complete_timestamp||0)
    ));

    if(!props.expanded) {
        todo_tasks_sorted=todo_tasks_sorted.slice(0,todo_max_lines);
        compl_tasks_sorted=compl_tasks_sorted.slice(0,todo_max_lines);
    }

    if(todo_tasks.length===0) {
        todo_ui=(
            <div className="todo-empty-hint">
                &nbsp;无待办任务 <InboxOutlined />
            </div>
        );
    } else {
        todo_ui=(
            <div>
                {todo_tasks_sorted.map((t)=>(
                    <LazyLoad key={t.id} offset={100} placeholder={<div className="todo-lazyload-placeholder" />} once={true}>
                        <TodoTaskView task={t} />
                    </LazyLoad>
                ))}
                {(props.expanded || todo_tasks_sorted.length!==todo_tasks.length) && !!props.set_expanded &&
                    <ClickableText onClick={()=>props.set_expanded(!props.expanded)} className="todo-collapse-switch have-hover-bg">
                        {props.expanded ?
                            <span><CaretUpOutlined /> 收起</span> :
                            <span><CaretDownOutlined /> 还有 {todo_tasks.length-todo_tasks_sorted.length} 项</span>
                        }
                    </ClickableText>
                }
            </div>
        );
    }

    todo_cnt=todo_tasks.length;

    if(compl_tasks.length===0) {
        compl_ui=(
            <div className="todo-empty-hint">
                &nbsp;无完成任务 <InboxOutlined />
            </div>
        );
    } else {
        compl_ui=(
            <div>
                {compl_tasks_sorted.map((t)=>(
                    <LazyLoad key={t.id} offset={100} placeholder={<div className="todo-lazyload-placeholder" />} once={true}>
                        <TodoTaskView key={t.id} task={t} />
                    </LazyLoad>
                ))}
                {(props.expanded || compl_tasks_sorted.length!==compl_tasks.length) && !!props.set_expanded &&
                    <ClickableText onClick={()=>props.set_expanded(!props.expanded)} className="todo-collapse-switch have-hover-bg">
                        {props.expanded ?
                            <span><CaretUpOutlined /> 收起</span> :
                            <span><CaretDownOutlined /> 还有 {compl_tasks.length-compl_tasks_sorted.length} 项</span>
                        }
                    </ClickableText>
                }
            </div>
        );
    }

    return props.children(todo_ui,compl_ui,todo_cnt);
}