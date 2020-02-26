import React, {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';

import {Modals} from '../modals/Modals';
import {AppHeader} from './AppHeader';
import {TodoView} from './TodoView';
import {MainListView} from './MainListView';
import {Footer} from './Footer';
import {StickyMsgsView} from './StickyMsgsView';

import {do_refresh} from '../state/actions';

import './App.less';
import './task_colors.less';

const AUTO_REFRESH_THRESHOLD_MS=300000;

export function App(props) {
    const dispatch=useDispatch();

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
    },[loading]);

    // update components every hour, so date handling will be correct
    let timetag=loading.last_update_time ? Math.floor(+loading.last_update_time/3600000) : 0;

    return (
        <div>
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
        </div>
    );
}