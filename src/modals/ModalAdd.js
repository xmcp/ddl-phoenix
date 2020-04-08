import React, {useState, useEffect, useRef} from 'react';
import {useDispatch, useSelector, useStore} from 'react-redux';
import {Modal, Input, DatePicker, Popover, Select, Menu, message, Checkbox} from 'antd';

import {ItemBreadcrumb} from '../widgets/ItemBreadcrumb';
import {SharedHelp} from './modal_common';

import moment from 'moment';
import {sister_fetch} from '../state/sister';
import {magic_expand, MagicExpandHelp, magic_extend} from '../logic/magic_expand';
import {scope_name, prev_scope, moment_to_day, colortype} from '../functions';
import {do_interact, close_modal, show_modal_for_last_task} from '../state/actions';

import {
    PlusSquareOutlined,
    EditOutlined,
    QuestionCircleOutlined,
    FolderAddOutlined,
    SearchOutlined
} from '@ant-design/icons';

const DOUBLE_ENTER_THRESHOLD_MS=250;
const DUE_DELTA_DAYS=[0,1,7,14];

function get_delta_days(ts_a,ts_b) {
    let t_a=moment_to_day(moment.unix(ts_a)), t_b=moment_to_day(moment.unix(ts_b));
    return t_b.diff(t_a,'days');
}

function MarketProjView(props) {
    const already_added_projs=useSelector((state)=>state.project);

    let name=props.chosen[props.proj.share_hash];
    if(name===undefined) name=null;

    let tasks=props.res.tasks_o[props.proj.pid]||[];

    let already_added=!!(already_added_projs[props.proj.pid]);

    function set_name(n) {
        props.set_chosen(Object.assign({},props.chosen,{
            [props.proj.share_hash]: n,
        }));
    }

    return (
        <div className="market-project-widget">
            <p className="market-project-name-line">
                <Checkbox checked={name!==null} onChange={(e)=>set_name(e.target.checked ? props.proj.name : null)} disabled={already_added}>
                    {name===null && <b>{props.proj.share_name}</b>}
                    {already_added && '（已添加）'}
                </Checkbox>
                {name!==null &&
                    <Input
                        value={name} onChange={(e)=>set_name(e.target.value)}
                        size="small" className="market-project-name-txt" autoFocus={true}
                    />
                }
            </p>
            <div className="task-list-collapsed market-project-tasks">
                {tasks.length===0 &&
                    <span>没有任务</span>
                }
                {tasks.map((tid)=>{
                    let task=props.res.tasks_li[tid];
                    return (
                        <span className={'task-badge task-color-'+colortype(task)}>{task.name}</span>
                    );
                })}
            </div>
        </div>
    )
}

export function ModalAdd(props) {
    const dispatch=useDispatch();
    const store_getter=useStore();
    const modal=useSelector((state) => state.local.modal);

    const [tab,set_tab]=useState('create');
    // create
    const [names,set_names]=useState('');
    const [task_due_first,set_task_due_first]=useState(null);
    const [task_due_delta,set_task_due_delta]=useState(7);
    // market
    const [search_term,set_search_term]=useState('');
    const [search_res,set_search_res]=useState(null);
    const [search_loading,set_search_loading]=useState(false);
    const [market_chosen,set_market_chosen]=useState({});

    const disable_post_state=useRef(false);

    useEffect(() => {
        set_tab('create');

        set_names('');
        set_task_due_first(null);
        set_task_due_delta(7);

        set_search_res(null);
        set_search_loading(false);
        set_market_chosen({});
        set_search_term('');

        if(modal.visible && modal.type==='add') {
            disable_post_state.current=false;

            let store=store_getter.getState();

            if(modal.scope==='project')
                set_search_term(store.zone[modal.itemid].name);

            // magic extend
            if(modal.scope==='task') {
                let subtasks_order=store.project[modal.itemid].task_order;
                if(subtasks_order.length===1) {
                    let res=magic_extend(store.task[subtasks_order[0]].name);
                    if(res)
                        set_names(res[1]);
                } else if(subtasks_order.length>=2) {
                    let last_task=store.task[subtasks_order[subtasks_order.length-1]];
                    let prelast_task=store.task[subtasks_order[subtasks_order.length-2]];
                    let res=magic_extend(last_task.name);
                    if(res && res[0]===prelast_task.name) {
                        set_names(res[1]);
                        if(prelast_task.due && last_task.due) {
                            let delta_due_days=get_delta_days(prelast_task.due,last_task.due);
                            if(DUE_DELTA_DAYS.indexOf(delta_due_days)!==-1)
                                set_task_due_first(moment.unix(last_task.due+delta_due_days*86400));
                        }
                    }
                }
            }
        }
    }, [modal,store_getter]);

    function do_post_create(ns) {
        if(disable_post_state.current) return;

        let name_list=ns.split(/\n/).map((n) => n.trim()).filter((n) => n);
        if(name_list.length) {
            disable_post_state.current=true;

            dispatch(do_interact('add', modal.scope, {
                parent_id: modal.itemid,
                names: name_list,
                ...(modal.scope==='task' ? {
                    task_due_first: task_due_first ? task_due_first.unix() : null,
                    task_due_delta: task_due_delta,
                } : {}),
            }))
                .then((success)=>{
                    if(!success) {
                        disable_post_state.current=false;
                        return;
                    }

                    // disable_post_state is not recovered because this modal will be closed anyway

                    if(modal.scope==='task' && name_list.length===1)
                        dispatch(show_modal_for_last_task('update',modal.itemid,{from_modal_add: true}));
                    else
                        dispatch(close_modal());
                });
        }
    }

    const last_enter_ts=useRef(-DOUBLE_ENTER_THRESHOLD_MS);

    function on_create_press_enter(e) {
        let last_enter=last_enter_ts.current;
        last_enter_ts.current=(+new Date());
        let expanded_names=null;

        // press enter at the only line: do magic expand
        if(modal.scope==='task' && e.target.value.indexOf('\n')=== -1/* && e.target.selectionStart===e.target.value.length*/) {
            expanded_names=magic_expand(e.target.value);
            set_names(expanded_names);
        }

        // post when double enter or ctrl+enter
        if(e.ctrlKey || last_enter_ts.current-last_enter<DOUBLE_ENTER_THRESHOLD_MS) {
            if(expanded_names) // propagate new names manually because state hook is not updated yet
                do_post_create(expanded_names);
            else
                do_post_create(names);
        }
    }

    function on_create_keypress(e) {
        if(e.key.toLowerCase()!=='enter')
            last_enter_ts.current= -DOUBLE_ENTER_THRESHOLD_MS;
    }

    function do_market_search(term) {
        if(search_loading) return;

        set_search_loading(true);
        set_market_chosen({});
        set_search_res(null);

        sister_fetch('/market/search_project',{term: term},store_getter.getState().local.token)
            .then((json)=>{
                if(json.error) throw (json.error_msg||json.error);
                set_search_res(json);
                set_search_loading(false);
            })
            .catch((e)=>{
                message.error(''+e);
                set_search_res(null);
                set_search_loading(false);
            });
    }

    function do_post_market() {
        if(disable_post_state.current) return;

        let li=[];
        Object.keys(market_chosen).forEach((share_hash)=>{
            let name=market_chosen[share_hash];
            if(name)
                li.push(name+'@@'+share_hash);
        });

        if(li.length) {
            disable_post_state.current=true;

            dispatch(do_interact('add','project',{
                parent_id: modal.itemid,
                names: li,
            }))
                .then((success)=>{
                    if(!success) {
                        disable_post_state.current=false;
                        return;
                    }

                    dispatch(close_modal());
                });
        } else { // ok button -> search
            do_market_search(search_term);
        }
    }

    if(modal.type!=='add') return (<Modal visible={false} />);

    let is_multiple_names=(names.trim().indexOf('\n')!==-1);

    function do_post() {
        if(tab==='create')
            do_post_create(names);
        else if(tab==='market')
            do_post_market();
    }

    return (
        <Modal
            visible={modal.visible}
            title={<span><PlusSquareOutlined /> 新建{scope_name(modal.scope)}</span>}
            onCancel={() => dispatch(close_modal())}
            onOk={()=>do_post()}
            destroyOnClose={true}
            bodyStyle={modal.scope==='project' ? {
                paddingTop: '.5em',
            } : null}
            width={600}
        >
            {modal.scope==='project' &&
                <>
                    <Menu selectedKeys={[tab]} onClick={(e)=>set_tab(e.key)}  mode="horizontal">
                        <Menu.Item key="create">
                            <FolderAddOutlined /> &nbsp;
                            创建
                        </Menu.Item>
                        <Menu.Item key="market">
                            <SearchOutlined /> &nbsp;
                            搜索
                        </Menu.Item>
                    </Menu>
                    <br />
                </>
            }
            {tab==='create' &&
                <>
                    {modal.scope!=='zone' &&
                        <div>
                            <ItemBreadcrumb scope={prev_scope(modal.scope)} id={modal.itemid} suffix={<EditOutlined />} />
                            <br />
                            <br />
                        </div>
                    }
                    <Input.TextArea
                        value={names} onChange={(e) => set_names(e.target.value)} autoSize={true} key={modal.visible}
                        autoFocus={true}
                        onPressEnter={on_create_press_enter} onKeyPress={on_create_keypress}
                        placeholder={scope_name(modal.scope)+'名称（每行一个）'}
                    />
                    <br />
                    {modal.scope==='task' && (task_due_first || is_multiple_names) &&
                        <div>
                            <br />
                            <DatePicker
                                onChange={(m)=>set_task_due_first(m ? moment_to_day(m,true) : null)} value={task_due_first}
                                allowClear={true} placeholder="设置截止日期"
                                format="YYYY-MM-DD (dd) H点"
                                showTime={{
                                    format: 'H点',
                                    disabledHours: ()=>[1,2,3,4,5,6,7],
                                    hideDisabledOptions: true,
                                    allowClear: true,
                                    defaultValue: moment('0','H'),
                                }}
                                inputReadOnly={true}
                            />
                            {!!task_due_first && is_multiple_names &&
                                <span>
                                    &nbsp;起每隔&nbsp;
                                    <Select
                                        value={task_due_delta}
                                        onChange={(v) => set_task_due_delta(v)} min={0} max={999}
                                        className="modal-add-delta-number-input"
                                    >
                                        {DUE_DELTA_DAYS.map((d)=>(
                                            <Select.Option key={d} value={d}>{d}天</Select.Option>
                                        ))}
                                    </Select>
                                </span>
                            }
                            <br />
                        </div>
                    }
                    <br />
                    <p>
                        连按两次 ↵ 提交 &nbsp;
                        {modal.scope==='project' &&
                            <Popover title="用户间分享" content={<SharedHelp />} trigger="click">
                                &nbsp;<a>可以粘贴分享ID <QuestionCircleOutlined /></a>
                            </Popover>
                        }
                        {modal.scope==='task' &&
                            <span>
                                &nbsp;
                                <Popover title="批量添加" content={<MagicExpandHelp />} trigger="click">
                                    &nbsp;<a> 支持批量添加 <QuestionCircleOutlined /></a>
                                </Popover>
                            </span>
                        }
                    </p>
                </>
            }
            {tab==='market' &&
                <>
                    <Input.Search
                        value={search_term} onChange={(e)=>set_search_term(e.target.value)} onSearch={do_market_search}
                        autoFocus={true} placeholder="按名称搜索" loading={search_loading}
                    />
                    {search_res ?
                        <div>
                            <br />
                            {!search_res.result.length &&
                                <div className="center">
                                    <b>没有找到结果</b>
                                </div>
                            }
                            {search_res.result.map((proj)=>(
                                <MarketProjView
                                    key={proj.pid} proj={proj} res={search_res}
                                    chosen={market_chosen} set_chosen={set_market_chosen}
                                />
                            ))}
                        </div> :
                        <div className="center">
                            <br />
                            在这里查找其他用户公开分享的列表
                        </div>
                    }
                </>
            }
        </Modal>
    );
}