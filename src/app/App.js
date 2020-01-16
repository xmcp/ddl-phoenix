import React from 'react';

import {Modals} from './Modals';
import {AppHeader} from './AppHeader';

import './App.less';
import {TodoView} from './TodoView';
import {MainListView} from './MainListView';
import {Footer} from './Footer';

export function App(props) {
    return (
        <div>
            <Modals />
            <AppHeader />
            <div className="skip-header width-container-leftonly app-main">
                <TodoView />
                <MainListView />
            </div>
            <Footer />
        </div>
    );
}