import React, {useMemo, useState, useRef, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Tooltip, Popover, Radio} from 'antd';

import {IconForColorType} from '../widgets/IconForColorType';
import {ItemBreadcrumb} from '../widgets/ItemBreadcrumb';

import {colortype, completeness_name, friendly_date, moment_to_day} from '../functions';
import {show_modal, do_update_completeness, do_interact} from '../state/actions';
import moment from 'moment';

import './TaskView.less';
import {EditOutlined, BulbOutlined, CloseOutlined, CloseCircleOutlined} from '@ant-design/icons';

const STABLIZE_THRESHOLD_MS=100;

// stolen from react-lazyload, modified by xmcp
function scroll_parents(node) {
    let excludeStaticParent=(node.style.position==='absolute');
    let overflowRegex=/(scroll|auto)/;
    let parent=node;
    let res=[node.ownerDocument||node.documentElement||document.documentElement];

    while (parent) {
        if (!parent.parentNode) {
            return res;
        }

        let style = window.getComputedStyle(parent);
        let position = style.position;
        let overflowX = style['overflow-x'];
        let overflowY = style['overflow-y'];

        if (position === 'static' && excludeStaticParent) {
            parent = parent.parentNode;
            continue;
        }

        if (overflowRegex.test(overflowX) || overflowRegex.test(overflowY)) {
            res.push(parent);
        }

        parent = parent.parentNode;
    }

    return node.ownerDocument || node.documentElement || document.documentElement;
}

function WithDueTooltip(props) {
    let tooltip_text=(
        <div className="due-tooltip">
            {props.task.due ?
                (friendly_date(props.task.due, false)+' 截止') :
                '无截止日期'
            }
        </div>
    );

    return (
        <Tooltip
            title={tooltip_text} trigger="hover" className={props.className||null} align={{offset: [0,2]}}
            visible={props.visible} onVisibleChange={props.onVisibleChange}
            overlayClassName="pointer-event-none" autoAdjustOverflow={false}
            mouseEnterDelay={0} mouseLeaveDelay={0}
            onTouchEnd={props.onTouchEnd}
        >
            {props.children}
        </Tooltip>
    );
}

function TaskDetails(props) {
    const dispatch=useDispatch();

    let compl_order=['todo','highlight','done','ignored'];

    function update_compl(compl) {
        dispatch(do_update_completeness([props.tid],compl))
            .then((success)=>{
                if(success)
                    props.hide();
            })
    }

    let ui_compl_value=props.task.completeness;
    // invite user to activte task
    if(!props.external && props.task.status==='placeholder' && ui_compl_value==='todo')
        ui_compl_value='_placeholder';

    let desc_chunks=useMemo(()=>{
        let raw=(props.task.desc||'').split(/([^a-zA-Z0-9.@#$%^*_='"<>‘’“”《》])/g);
        let res=[];
        for(let idx=0,chars=0;idx<raw.length;idx+=2) {
            let s=raw[idx]+(raw[idx+1]||'');
            res.push([chars,s]);
            chars+=s.length;
        }
        if(res.length===1 && res[0][1]==='')
            res=[];
        return res;
    },[props.task.desc]);

    let [marking_desc_idx,set_marking_desc_idx]=useState(0);

    useEffect(()=>{
        set_marking_desc_idx(0);
    },[props.task.id]);

    return (
        <div className="task-details">
            <div className="task-details-close-btn" onClick={props.hide}><CloseOutlined /></div>
            <div
                className={'task-details-statline '+(props.external ? '' : 'task-details-statline-link')}
                onClick={props.external ? null : ()=>{props.hide(); dispatch(show_modal('update','task',props.tid))}}
            >
                <p>
                    {!props.external &&
                        <a><EditOutlined />&nbsp;</a>
                    }
                    {props.task.status==='placeholder' &&
                        '未布置，'
                    }
                    {props.task.due ?
                        (friendly_date(props.task.due, false)+' 截止') :
                        '无截止日期'
                    }
                </p>
            </div>
            <div className="task-details-complgroup">
                <Radio.Group value={ui_compl_value} onChange={(e)=>update_compl(e.target.value)}>
                    {compl_order.map((compl)=>(
                        <Radio.Button key={compl} value={compl} className={'task-complbtn task-complbtn-'+compl+(compl===ui_compl_value ? ' task-complbtn-selected' : '')}>
                            <IconForColorType type={compl} /> {completeness_name(compl)}
                        </Radio.Button>
                    ))}
                </Radio.Group>
            </div>
            {!!desc_chunks.length &&
                <div className="task-details-desc" onMouseOut={()=>set_marking_desc_idx(0)}>
                    <div
                        className={'task-details-desc-prefix'+(props.task.desc_idx ? ' task-details-desc-prefix-clickable' : '')}
                        onClick={()=>dispatch(do_interact('update','desc_idx',{
                            id: props.task.id,
                            desc_idx: null,
                        }))}
                        onMouseOver={()=>set_marking_desc_idx(0)}
                    >
                        &nbsp;{props.task.desc_idx ? <CloseCircleOutlined /> : <BulbOutlined />}&nbsp;
                    </div>
                    {desc_chunks.map(([idx,s])=>(
                        <span
                            key={idx}
                            className={
                                ((props.task.desc_idx && props.task.desc_idx>idx) ? ' task-details-desc-marked' : '')+
                                (marking_desc_idx>idx ? ' task-details-desc-marking' : '')
                            }
                            onClick={()=>dispatch(do_interact('update','desc_idx',{
                                id: props.task.id,
                                desc_idx: idx+s.length,
                            }))}
                            onMouseOver={()=>set_marking_desc_idx(idx+s.length)}
                        >
                            {s}
                        </span>
                    ))}
                </div>
            }
        </div>
    );
}

export function TaskView(props) {
    const dispatch=useDispatch();
    const task=useSelector((state)=>state.task[props.tid]);
    const term=useSelector((state)=>state.local.fancy_search_term);
    const is_sorting=useSelector((state)=>state.local.main_list_sorting);
    const [card_mode,set_card_mode]=useState(0); // 0: hidden, 1: tooltip, 2: tooltip+popover

    const last_touch_end_ts=useRef(-STABLIZE_THRESHOLD_MS);
    const last_click_ts=useRef(-STABLIZE_THRESHOLD_MS);
    const last_vis_change_ts=useRef(-STABLIZE_THRESHOLD_MS);
    const ui_elem=useRef(null);

    function on_touch_end() {
        last_touch_end_ts.current=(+new Date());
    }
    function on_click() {
        last_click_ts.current=(+new Date());
    }

    // close popover upon fancy search input
    useEffect(()=>{
        set_card_mode(0);
    },[term]);

    // close popover upon sorting
    useEffect(()=>{
       if(is_sorting)
           set_card_mode(0);
    },[is_sorting]);

    // close popover upon parent scrolling
    useEffect(()=>{
        if(card_mode===2 && ui_elem.current) {
            let parent_elems=scroll_parents(ui_elem.current);
            function on_scroll() {
                set_card_mode(0);
            }
            console.log('popover closer bind scroll',parent_elems);
            parent_elems.forEach((elem)=>{
                elem.addEventListener('scroll',on_scroll,{passive: true});
            });
            return ()=>{
                parent_elems.forEach((elem)=>{
                    elem.removeEventListener('scroll',on_scroll,{passive: true});
                });
            };
        }
    },[card_mode]);

    function may_set_card_mode(m) {
        if((+new Date())-last_vis_change_ts.current>STABLIZE_THRESHOLD_MS) {
            last_vis_change_ts.current=(+new Date());
            set_card_mode(m);
            return true;
        } else
            return false;
    }

    function on_tooltip_visible_change(v) {
        if(card_mode>1) // 2 -> * is handled by popover
            return;

        if(v) { // touch should make 0 -> 2 instead of 0 -> 1
            may_set_card_mode((+new Date())-last_touch_end_ts.current<STABLIZE_THRESHOLD_MS ? 2 : 1);
        } else { // 1 -> 0
            // no `may` here because we want to skip threshold test
            set_card_mode(0);
        }
    }
    function on_popover_visible_change(v) {
        if(v) { // (0 or 1) -> 2
            may_set_card_mode(2);
        } else { // 2 -> 0
            if(may_set_card_mode(0)) // is not debounced
                if((+new Date())-last_click_ts.current<=STABLIZE_THRESHOLD_MS) // double click
                    if(!props.external) // has permission
                        dispatch(show_modal('update','task',props.tid));
        }
    }

    let today_ts=moment_to_day(moment()).unix();

    let ctype=colortype(task);
    return useMemo(()=>(
        props.todo_style ?
            <div key={ctype} onTouchEndCapture={on_touch_end} ref={ui_elem}>
                <Popover
                    title="任务属性" trigger="click" placement="bottom"
                    content={<TaskDetails tid={props.tid} external={props.external} task={task} hide={()=>on_popover_visible_change(false)} />}
                    visible={card_mode>=2} onVisibleChange={on_popover_visible_change}
                    overlayClassName="task-details-custom-popover"
                    getPopupContainer={()=>props.popup_container_ref ? (props.popup_container_ref.current||document.body) : document.body}
                >
                    <div className={'task-badge todo-task-view task-color-'+ctype} onClick={on_click}>
                        <div className="todo-task-ddl-part">
                            <IconForColorType type={ctype} className="task-badge-icon todo-task-icon-left" />
                            <span className={(task.completeness!=='done' && task.due && task.due<=today_ts) ? 'task-ddl-already-dued' : ''}>
                                {
                                    task.completeness==='done' ?
                                        (friendly_date(task.complete_timestamp,true)+' 完成') :
                                        task.due ?
                                            (friendly_date(task.due,true)+' 截止') :
                                            '无截止日期'
                                }
                            </span>
                        </div>
                        <div className="todo-task-name-part">
                            <IconForColorType type={ctype} className="task-badge-icon todo-task-icon-right" />
                            <ItemBreadcrumb scope="task" id={props.tid} />
                        </div>
                    </div>
                </Popover>
            </div> :
            <span key={ctype} onTouchEndCapture={on_touch_end} ref={ui_elem}>
                <WithDueTooltip
                    task={task} className={'task-view '+(props.can_sort?' reorder-handle reorder-handle-task':'')}
                    visible={card_mode>=1} onVisibleChange={on_tooltip_visible_change}
                >
                    <Popover
                        title="任务属性" trigger="click" placement="bottom"
                        content={<TaskDetails tid={props.tid} external={props.external} task={task} hide={()=>on_popover_visible_change(false)} />}
                        visible={card_mode>=2} onVisibleChange={on_popover_visible_change}
                        overlayClassName="task-details-custom-popover"
                        getPopupContainer={()=>props.popup_container_ref.current||document.body}
                    >
                        <span className={'task-badge task-color-'+ctype} onClick={on_click}>
                            <IconForColorType type={ctype} className="task-badge-icon" />
                            <span className="task-badge-label">{task.name}</span>
                        </span>
                    </Popover>
                </WithDueTooltip>
            </span>
    ),[props.todo_style,task,card_mode,ctype,props.tid,props.can_sort,props.external]);
}