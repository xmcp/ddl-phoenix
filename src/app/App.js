import React from 'react';

import {Modals} from './Modals';
import {AppHeader} from './AppHeader';
import {TodoView} from './TodoView';
import {MainListView} from './MainListView';
import {Footer} from './Footer';
import {StickyMsgsView} from './StickyMsgsView';

import './App.less';
import './task_colors.less';

export function App(props) {
    return (
        <div>
            <Modals />
            <AppHeader />
            <div className="skip-header width-container">
                <StickyMsgsView />
            </div>
            <div className="width-container-leftonly app-main">
                <TodoView />
                <MainListView />
            </div>
            <Footer />
        </div>
    );
}