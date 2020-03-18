import React, {useState, useEffect, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Tabs, Badge, Button, Radio} from 'antd';
import {SwitchTransition, CSSTransition} from 'react-transition-group';

import {Modals} from '../modals/Modals';
import {AppHeader} from './AppHeader';
import {TodoViewFx} from './TodoView';
import {MainListView} from './MainListView';
import {Footer} from './Footer';
import {StickyMsgsView} from './StickyMsgsView';
import {RightFader} from '../widgets/Layout';
import {PosFixer} from '../widgets/PosFixer';
import {FancySearchCtrl} from './FancySearch';

import moment from 'moment';
import {do_refresh} from '../state/actions';
import {moment_to_day} from '../functions';
import {forceCheck} from 'react-lazyload';

import './App.less';
import './task_colors.less';
import {CaretUpOutlined, CaretDownOutlined} from '@ant-design/icons';
import {SwipeHandler} from '../widgets/SwipeHandler';

const AUTO_REFRESH_THRESHOLD_MS=10*60*1000; // 10min

const TODO_TASK_BADGE_STYLE={backgroundColor: '#fff', color: '#777', boxShadow: '0 0 0 1px #777 inset'};

function numfix(v,mi,ma) {
    return v>ma ? ma : (v<mi ? mi : v);
}

function MgmtView(props) {
    return (
        <div className="app-main">
            <div className="slim-padding-x">
                <StickyMsgsView />
            </div>
            <MainListView />
        </div>
    );
}

function AppSlim(props) {
    const dispatch=useDispatch();
    const term=useSelector((state)=>state.local.fancy_search_term);

    // go to mgmt tab upon fancy search
    useEffect(()=>{
        if(term)
            set_tab(2);
    },[term]);

    const [tab,set_tab]=useState(1);

    function tab_onchange(e) {
        set_tab(e.target.value);
    }
    function on_swipe(dir) {
        if(term) return;
        set_tab(numfix(tab-dir,0,2));
    }

    return (
        <div className="app-slim">
            <TodoViewFx expanded={true} set_expanded={null}>{(todo_ui,compl_ui,todo_cnt)=>(
                <div>
                    <div className="slim-todo-tab-margin-top" />
                    <div className="slim-todo-tab-container">
                        <Radio.Group value={tab} onChange={tab_onchange}>
                            <Radio.Button value={0}>
                                已完成
                            </Radio.Button>
                            <Radio.Button value={1}>
                                待办 <Badge count={todo_cnt} showZero={true} className="todo-task-badge" style={TODO_TASK_BADGE_STYLE} />
                            </Radio.Button>
                            <Radio.Button value={2}>
                                管理任务
                            </Radio.Button>
                        </Radio.Group>
                    </div>
                    <SwipeHandler onSwipe={on_swipe}>
                        <SwitchTransition mode="out-in">
                            <CSSTransition key={tab} timeout={75} classNames="slim-todo-anim">
                                <div className="slim-todo-overflower">
                                    {tab===0 ?
                                        <div className="app-main slim-padding-x">
                                            <StickyMsgsView />
                                            {compl_ui}
                                        </div> :
                                    tab===1 ?
                                        <div className="app-main slim-padding-x">
                                            <StickyMsgsView />
                                            {todo_ui}
                                        </div> :
                                        <MgmtView />
                                    }
                                    <Footer />
                                </div>
                            </CSSTransition>
                        </SwitchTransition>
                    </SwipeHandler>
                </div>
            )}</TodoViewFx>
        </div>
    )
}

function AppLarge(props) {
    const term=useSelector((state)=>state.local.fancy_search_term);
    const [todo_expanded,set_todo_expanded]=useState(false);

    useEffect(()=>{
        setTimeout(forceCheck,1);
    },[todo_expanded]);

    return (
        <div className="app-large">
            {term!==null &&
                <div className="fancy-search-height-placeholder" />
            }
            <div className="skip-header app-main">
                <PosFixer>
                    {!term &&
                        <TodoViewFx expanded={todo_expanded} set_expanded={set_todo_expanded}>{(todo_ui,compl_ui,todo_cnt)=>(
                            <div className="todo-view-large-container">
                                <Tabs
                                    tabPosition="left" tabBarGutter={0} className="custom-ant-tabs"
                                    tabBarExtraContent={!todo_expanded ? null : (
                                        <Button onClick={()=>set_todo_expanded(false)}><CaretUpOutlined /> 收起</Button>
                                    )}
                                    onChange={()=>{
                                        set_todo_expanded(false);
                                        setTimeout(forceCheck,1);
                                    }}
                                >
                                    <Tabs.TabPane key="todo" tab={<span><Badge count={todo_cnt} showZero={true} className="todo-task-badge" style={TODO_TASK_BADGE_STYLE} /> 待办</span>}>
                                        {todo_ui}
                                    </Tabs.TabPane>
                                    <Tabs.TabPane key="done" tab={<span>已完成</span>}>
                                        {compl_ui}
                                    </Tabs.TabPane>
                                </Tabs>
                            </div>
                        )}</TodoViewFx>
                    }
                </PosFixer>
                <div className="width-container-leftonly">
                    {!term &&
                        <div className="width-container-rightonly">
                            <div className="todo-task-bottom-line" />
                        </div>
                    }
                    <div className="width-container-rightonly">
                        <StickyMsgsView />
                    </div>
                    <MainListView />
                </div>
            </div>
            <Footer />

            <RightFader />
        </div>
    );
}

export function App(props) {
    const dispatch=useDispatch();
    const is_sorting=useSelector((state)=>state.local.main_list_sorting);
    const slim=useSelector((state)=>state.local.is_slim);
    const loading=useSelector((state)=>state.local.loading);

    // auto refresh
    useEffect(()=>{
        function on_focus() {
            if(loading.last_update_time && loading.status==='done' && (+new Date())-loading.last_update_time>AUTO_REFRESH_THRESHOLD_MS) {
                dispatch(do_refresh());
            }
        }
        window.addEventListener('focus',on_focus);
        return ()=>{
            window.removeEventListener('focus',on_focus);
        }
    },[loading,dispatch]);

    // update components every day, so date handling will be correct
    let timetag=loading.last_update_time ? moment_to_day(moment(loading.last_update_time)).unix() : 0;

    return (
        <div className={is_sorting ? 'main-list-sorting' : 'not-main-list-sorting'}>
            <AppHeader />
            {slim ?
                <AppSlim key={timetag} /> :
                <AppLarge key={timetag} />
            }

            <Modals />
            <FancySearchCtrl />
        </div>
    );
}