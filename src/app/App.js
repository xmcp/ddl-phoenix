import React from 'react';
import {useSelector} from 'react-redux';

import {Modals} from './Modals';
import {AppHeader} from './AppHeader';
import {TodoView} from './TodoView';
import {MainListView} from './MainListView';
import {Footer} from './Footer';
import {StickyMsgsView} from './StickyMsgsView';

import './App.less';
import './task_colors.less';

export function App(props) {
    // update components every hour, so date handling will be correct
    let timetag=useSelector((state)=>(
        (state.loading && state.loading.last_update_time) ? Math.floor(+state.loading.last_update_time/3600000) : 0
    ));

    return (
        <div>
            <Modals key={'modals-'+timetag} />
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