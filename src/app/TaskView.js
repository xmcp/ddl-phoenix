import React, {useMemo, useState, useRef, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Tooltip, Popover, Radio} from 'antd';

import {IconForColorType} from '../widgets/IconForColorType';

import {colortype, completeness_name, friendly_date} from '../functions';
import {show_modal, do_update_completeness, do_interact} from '../state/actions';

import './TaskView.less';
import {EditOutlined} from '@ant-design/icons';
import BulbOutlined from '@ant-design/icons/lib/icons/BulbOutlined';
import CloseCircleOutlined from '@ant-design/icons/lib/icons/CloseCircleOutlined';

const STABLIZE_THRESHOLD_MS=100;

function WithDueTooltip(props) {
    /*
    let ctype=colortype(props.task);
    let ctype_name=completeness_name(ctype);

        <p>
            {props.task.complete_timestamp ? (friendly_date(props.task.complete_timestamp)+' ') : ''}
            {ctype_name}
        </p>
     */

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
            title={tooltip_text} trigger="hover" className={props.className||null}
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
            <div
                className={'task-details-statline '+(props.external ? '' : 'task-details-statline-link')}
                onClick={props.external ? null : ()=>{props.hide(); dispatch(show_modal('update','task',props.tid))}}
            >
                <p>
                    {!props.external &&
                        <a style={{float: 'right'}}><EditOutlined /></a>
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

    function on_touch_end() {
        last_touch_end_ts.current=(+new Date());
    }
    function on_click() {
        last_click_ts.current=(+new Date());
    }

    useEffect(()=>{
        set_card_mode(0);
    },[term]);
    useEffect(()=>{
       if(is_sorting)
           set_card_mode(0);
    },[is_sorting]);

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

    let ctype=colortype(task);
    return useMemo(()=>(
        <span key={ctype} onTouchEndCapture={on_touch_end}>
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
    ),[task,card_mode,ctype,props.tid,props.can_sort,props.external]);
}