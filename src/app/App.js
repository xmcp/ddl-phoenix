import React, {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';

import {Modals} from '../modals/Modals';
import {AppHeader} from './AppHeader';
import {TodoView} from './TodoView';
import {MainListView} from './MainListView';
import {Footer} from './Footer';
import {StickyMsgsView} from './StickyMsgsView';

import {do_refresh} from '../state/actions';
import moment from 'moment';

import './App.less';
import './task_colors.less';
import {moment_to_day} from '../functions';
import {RightFader} from '../widgets/Layout';

const AUTO_REFRESH_THRESHOLD_MS=10*60*1000; // 10min

export function App(props) {
    const dispatch=useDispatch();
    const is_sorting=useSelector((state)=>state.local.main_list_sorting);

    let loading=useSelector((state)=>state.local.loading);

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
            <Modals />
            <AppHeader />
            <div className="skip-header width-container">
                <StickyMsgsView />
            </div>
            <div className="width-container-leftonly app-main">
                <TodoView key={'todo-view-'+timetag} />
                <MainListView key={'main-list-view-'+timetag} />
            </div>
            <Footer />
            <RightFader />
        </div>
    );
}